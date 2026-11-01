import { BrowserContext, Page, Worker } from 'playwright-core';
import { EXTENSION_ID } from '../downloader/constants';
import { CoinbaseWallet } from './coinbase/coinbase';
import { MetaMaskWallet } from './metamask/metamask';

export type WalletTypes = typeof CoinbaseWallet | typeof MetaMaskWallet;
const WALLETS: WalletTypes[] = [CoinbaseWallet, MetaMaskWallet];
// Not URL.origin, which is "null" for chrome-extension URLs and so never matches a page or worker
const extensionOrigin = `chrome-extension://${EXTENSION_ID}/`;

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

export const closeWalletSetupPopup = async (
  id: WalletIdOptions,
  browserContext: BrowserContext,
  activeWalletPage: Page,
): Promise<void> => {
  const homeUrl = new URL(walletHomeUrl(id));

  // The stray page settles on the same route as the wallet's own page (eg. home.html#/), so the
  // hash can't tell them apart - but an approval popup is always a request, and carries either
  // its own path (MetaMask's notification.html) or the request in a query string (Coinbase
  // serves its popups from index.html). Match the home page, minus anything asking for input.
  const isStrayWalletPage = (page: Page): boolean => {
    try {
      const pageUrl = new URL(page.url());
      // URL.origin is "null" for chrome-extension URLs, so compare the extension id instead
      return pageUrl.host === homeUrl.host && pageUrl.pathname === homeUrl.pathname && !pageUrl.search;
    } catch {
      return false;
    }
  };

  const closeStrayPage = async (page: Page): Promise<void> => {
    if (page === activeWalletPage || page.isClosed() || !isStrayWalletPage(page)) return;
    await page.close().catch(() => undefined);
  };

  await Promise.all(browserContext.pages().map(closeStrayPage));

  browserContext.on('page', async (page) => {
    if (page === activeWalletPage) return;

    // A newly opened page reports about:blank until it navigates. Checking the url straight off
    // the event is why the stray page used to survive setup.
    await page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await closeStrayPage(page);
  });
};

// Actions wait for an element to stop moving before clicking it, so a wallet without animations responds
// sooner. This is set per page because a context-wide setting would also change the dapp under test.
export const reduceWalletMotion = async (browserContext: BrowserContext, walletPage: Page): Promise<void> => {
  await walletPage.emulateMedia({ reducedMotion: 'reduce' });

  browserContext.on('page', async (page) => {
    await page.waitForLoadState('domcontentloaded').catch(() => undefined);
    if (page.isClosed() || !page.url().startsWith(extensionOrigin)) return;
    await page.emulateMedia({ reducedMotion: 'reduce' }).catch(() => undefined);
  });
};

const findExtensionPage = (browserContext: BrowserContext): Page | undefined =>
  browserContext.pages().find((page) => page.url().startsWith(extensionOrigin));

const waitForExtensionPage = async (browserContext: BrowserContext, timeoutMs: number): Promise<Page | undefined> => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const extensionPage = findExtensionPage(browserContext);
    if (extensionPage) return extensionPage;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return undefined;
};

// Recent Chromium rejects a normal page.goto(chrome-extension://...) with
// ERR_BLOCKED_BY_CLIENT, so have the browser create the tab instead, which is the same
// browser-owned navigation as a toolbar click. It goes over CDP because MetaMask's LavaMoat
// rejects any evaluate in its service worker. If the wallet was only slow to open its own tab,
// that one is closed as a stray page.
export const openWalletHome = async (
  id: WalletIdOptions,
  browserContext: BrowserContext,
): Promise<Page | undefined> => {
  const session = await browserContext.newCDPSession(browserContext.pages()[0] ?? (await browserContext.newPage()));
  await session.send('Target.createTarget', { url: walletHomeUrl(id) });
  await session.detach();
  return waitForExtensionPage(browserContext, 60_000);
};

export const getWallet = async (id: WalletIdOptions, browserContext: BrowserContext): Promise<MetaMaskWallet> => {
  const wallet = getWalletType(id);

  // MetaMask 13 opens its extension page asynchronously. Depending on the
  // Chromium build, it can be a new tab or an existing blank tab navigating
  // in place, so an event-only wait loses the latter case. Wallets that never
  // open one would only sit out the wait. Opening one ourselves too early gets
  // MetaMask's "Background connection unresponsive" error page in place of the
  // wallet, since it only opens its own once its background has started, which
  // can take well over a minute on a busy machine.
  const autoOpenedPage = wallet.opensHomeOnInstall
    ? await waitForExtensionPage(browserContext, 180_000)
    : findExtensionPage(browserContext);
  if (autoOpenedPage) return new wallet(autoOpenedPage);

  // The worker registers shortly after launch, so wait for it rather than falling back straight away
  const isExtensionWorker = (item: Worker): boolean => item.url().startsWith(extensionOrigin);
  const worker =
    browserContext.serviceWorkers().find(isExtensionWorker) ??
    (await browserContext
      .waitForEvent('serviceworker', { predicate: isExtensionWorker, timeout: 60_000 })
      .catch(() => undefined));
  if (worker) {
    const openedPage = await openWalletHome(id, browserContext);
    if (openedPage) return new wallet(openedPage);
  }

  // Older extension builds may not open a page themselves. Preserve the
  // legacy fallback for those versions.
  const page = browserContext.pages()[0] ?? (await browserContext.newPage());

  if (page.url() === 'about:blank') {
    await page.goto(walletHomeUrl(id));
  }

  return new wallet(page);
};

const walletHomeUrl = (id: WalletIdOptions): string => {
  const wallet = getWalletType(id);
  return `chrome-extension://${EXTENSION_ID}${wallet.homePath}`;
};
