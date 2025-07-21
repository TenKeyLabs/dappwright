import { BrowserContext, Page } from 'playwright-core';
import { EXTENSION_ID } from '../downloader/constants';
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

export const closeWalletSetupPopup = (id: WalletIdOptions, browserContext: BrowserContext): void => {
  browserContext.on('page', async (page) => {
    if (page.url() === walletHomeUrl(id)) {
      await page.close();
    }
  });
};

export const getWallet = async (id: WalletIdOptions, browserContext: BrowserContext): Promise<MetaMaskWallet> => {
  const wallet = getWalletType(id);
  const page = browserContext.pages()[0];

  if (page.url() === 'about:blank') {
    await page.goto(walletHomeUrl(id));
  }

  return new wallet(page);
};

const walletHomeUrl = (id: WalletIdOptions): string => {
  const wallet = getWalletType(id);
  return `chrome-extension://${EXTENSION_ID}${wallet.homePath}`;
};
