import { BrowserContext, Page } from 'playwright-core';
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

  if (browserContext.pages().length === 1) await browserContext.waitForEvent('page');
  const page = browserContext.pages()[1];

  return new wallet(page);
};
