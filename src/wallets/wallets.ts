import { BrowserContext, Page } from 'playwright-core';
import { EXTENSION_ID } from '../downloader/downloader';
import { CoinbaseWallet } from './coinbase/coinbase';
import { MetaMaskWallet } from './metamask/metamask';

export type Step<Options> = (page: Page, options?: Options) => void;
export type WalletIdOptions = 'metamask' | 'coinbase';
export type WalletTypes = typeof CoinbaseWallet | typeof MetaMaskWallet;
export type WalletOptions = {
  seed?: string;
  password?: string;
  showTestNets?: boolean;
};

export const WALLETS: WalletTypes[] = [CoinbaseWallet, MetaMaskWallet];

export const getWalletType = (id: WalletIdOptions): WalletTypes => {
  const walletType = WALLETS.find((wallet) => {
    return wallet.id === id;
  });

  if (!walletType) throw new Error(`Wallet ${id} not supported`);

  return walletType;
};

export const getWallet = async (id: WalletIdOptions, browserContext: BrowserContext): Promise<MetaMaskWallet> => {
  const wallet = getWalletType(id);

  if (browserContext.pages().length === 1) {
    let page: Page;
    try {
      // Wait for the wallet to pop up
      page = await browserContext.waitForEvent('page', { timeout: 2000 });
      await browserContext.pages()[0].close();
      return new wallet(page);
    } catch {
      // Open the wallet manually if tab doesn't pop up
      page = browserContext.pages()[0];
      await page.goto(`chrome-extension://${EXTENSION_ID}${wallet.homePath}`);
    }

    return new wallet(page);
  }

  const page = browserContext.pages()[0];
  return new wallet(page);
};
