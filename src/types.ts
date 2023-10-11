import { BrowserContext, Page } from 'playwright-core';
import Wallet from './wallets/wallet';
import { WalletIdOptions } from './wallets/wallets';
export { CoinbaseWallet } from './wallets/coinbase/coinbase';
export { MetaMaskWallet } from './wallets/metamask/metamask';

export type LaunchOptions = OfficialOptions | DappwrightBrowserLaunchArgumentOptions;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DappwrightBrowserLaunchArgumentOptions = Omit<any, 'headed'>;

export type DappwrightConfig = Partial<{
  dappwright: LaunchOptions;
}>;

export type OfficialOptions = DappwrightBrowserLaunchArgumentOptions & {
  wallet: WalletIdOptions;
  version: 'latest' | string;
  headless?: boolean;
};

export type ProcessOptions = {
  workerId?: number;
};

export type DappwrightLaunchResponse = {
  wallet: Wallet;
  browserContext: BrowserContext;
};

export type AddNetwork = {
  networkName: string;
  rpc: string;
  chainId: number;
  symbol: string;
};

export type AddToken = {
  tokenAddress: string;
  symbol?: string;
  decimals?: number;
};

export type TransactionOptions = {
  gas?: number;
  gasLimit?: number;
  priority: number;
};

export type Dappwright = {
  addNetwork: (options: AddNetwork) => Promise<void>;
  addToken: (options: AddToken) => Promise<void>;
  approve: () => Promise<void>;
  confirmNetworkSwitch: () => Promise<void>;
  confirmTransaction: (options?: TransactionOptions) => Promise<void>;
  createAccount: () => Promise<void>;
  deleteAccount: (accountNumber: number) => Promise<void>;
  deleteNetwork: (name: string) => Promise<void>;
  getTokenBalance: (tokenSymbol: string) => Promise<number>;
  hasNetwork: (name: string) => Promise<boolean>;
  importPK: (pk: string) => Promise<void>;
  lock: () => Promise<void>;
  sign: () => Promise<void>;
  switchAccount: (accountNumber: number) => Promise<void>;
  switchNetwork: (network: string) => Promise<void>;
  unlock: (password?: string) => Promise<void>;

  page: Page;
};
