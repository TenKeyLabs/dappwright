import { BrowserContext, Page } from 'playwright-core';
import Wallet from './wallets/wallet';
import { WalletIdOptions } from './wallets/wallets';

export type LaunchOptions = OfficialOptions | DappwrightBrowserLaunchArgumentOptions;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DappwrightBrowserLaunchArgumentOptions = Omit<any, 'headed'>;

export type DappwrightConfig = Partial<{
  dappwright: LaunchOptions;
}>;

export type OfficialOptions = DappwrightBrowserLaunchArgumentOptions & {
  wallet: WalletIdOptions;
  version: 'latest' | string;
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
  priority?: number;
};

export type Dappwright = {
  lock: () => Promise<void>;
  unlock: (password?: string) => Promise<void>;
  addNetwork: (options: AddNetwork) => Promise<void>;
  addToken: (options: AddToken) => Promise<void>;
  createAccount: () => Promise<void>;
  importPK: (pk: string) => Promise<void>;
  switchAccount: (accountNumber: number) => Promise<void>;
  switchNetwork: (network: string) => Promise<void>;
  confirmTransaction: (options?: TransactionOptions) => Promise<void>;
  sign: () => Promise<void>;
  approve: () => Promise<void>;
  getTokenBalance: (tokenSymbol: string) => Promise<number>;
  deleteAccount: (accountNumber: number) => Promise<void>;
  deleteNetwork: (name: string) => Promise<void>;
  page: Page;
};
