import { BrowserContext, Page } from 'playwright-core';
import { EXTENSION_ID } from '../downloader/constants';
import { CoinbaseWallet } from './coinbase/coinbase';
import { MetaMaskWallet } from './metamask/metamask';

export type WalletTypes = typeof CoinbaseWallet | typeof MetaMaskWallet;
type ExtensionApi = {
  runtime?: { getURL: (path: string) => string };
  tabs?: { create: (options: { url: string }) => unknown };
};
const WALLETS: WalletTypes[] = [CoinbaseWallet, MetaMaskWallet];

export type Step<Options> = (page: Page, options?: Options) => Promise<void>;
export type WalletIdOptions = 'metamask' | 'coinbase';
export type WalletOptions = {
  seed?: string;
  password?: string;
  showTestNets?: boolean;
};

export const getWalletType = (id: WalletIdOptions): WalletTypes => {
  const walletType = WALLETS.find((wallet) => {
    return wallet.id === id;
  });

  if (!walletType) throw new Error(`Wallet ${id} not supported`);

  return walletType;
};

export const closeWalletSetupPopup = (
  id: WalletIdOptions,
  browserContext: BrowserContext,
  activeWalletPage: Page,
): void => {
  browserContext.on('page', async (page) => {
    if (page !== activeWalletPage && page.url() === walletHomeUrl(id)) {
      await page.close();
    }
  });
};

export const getWallet = async (id: WalletIdOptions, browserContext: BrowserContext): Promise<MetaMaskWallet> => {
  const wallet = getWalletType(id);
  const homeUrl = walletHomeUrl(id);
  const extensionOrigin = new URL(homeUrl).origin;
  const findExtensionPage = (): Page | undefined =>
    browserContext.pages().find((page) => page.url().startsWith(extensionOrigin));
  const waitForExtensionPage = async (timeoutMs: number): Promise<Page | undefined> => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const extensionPage = findExtensionPage();
      if (extensionPage) return extensionPage;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return undefined;
  };

  // MetaMask 13 opens its extension page asynchronously. Depending on the
  // Chromium build, it can be a new tab or an existing blank tab navigating
  // in place, so an event-only wait loses the latter case.
  const autoOpenedPage = await waitForExtensionPage(5_000);
  if (autoOpenedPage) return new wallet(autoOpenedPage);

  // Recent Chromium rejects a normal page.goto(chrome-extension://...) with
  // ERR_BLOCKED_BY_CLIENT. Ask the extension service worker to create its own
  // tab instead; this is the same browser-owned navigation as a toolbar click.
  const worker = browserContext.serviceWorkers().find((item) => item.url().startsWith(extensionOrigin));
  if (worker) {
    await worker.evaluate((homePath) => {
      const extensionApi = (globalThis as typeof globalThis & { chrome?: ExtensionApi }).chrome;
      if (!extensionApi?.runtime?.getURL || !extensionApi.tabs?.create) {
        throw new Error('extension service worker cannot create a wallet tab');
      }
      return extensionApi.tabs.create({ url: extensionApi.runtime.getURL(homePath) });
    }, wallet.homePath);
    const openedByExtension = await waitForExtensionPage(10_000);
    if (openedByExtension) return new wallet(openedByExtension);
  }

  // Older extension builds may not open a page themselves. Preserve the
  // legacy fallback for those versions.
  const page = browserContext.pages()[0];

  if (page.url() === 'about:blank') {
    await page.goto(homeUrl);
  }

  return new wallet(page);
};

const walletHomeUrl = (id: WalletIdOptions): string => {
  const wallet = getWalletType(id);
  return `chrome-extension://${EXTENSION_ID}${wallet.homePath}`;
};
