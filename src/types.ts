import type { BrowserContext, Page } from 'playwright-core';
import type Wallet from './wallets/wallet';
import type { WalletIdOptions } from './wallets/wallets';
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
  additionalExtensions?: string[];
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

export type UpdateNetworkRpc = {
  chainId: number;
  rpc: string;
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
  createAccount: (name?: string) => Promise<void>;
  deleteAccount: (name: string) => Promise<void>;
  deleteNetwork: (name: string) => Promise<void>;
  getTokenBalance: (tokenSymbol: string) => Promise<number>;
  hasNetwork: (name: string) => Promise<boolean>;
  importPK: (pk: string) => Promise<void>;
  lock: () => Promise<void>;
  reject: () => Promise<void>;
  sign: () => Promise<void>;
  signin: () => Promise<void>;
  switchAccount: (name: string) => Promise<void>;
  switchNetwork: (network: string) => Promise<void>;
  unlock: (password?: string) => Promise<void>;
  updateNetworkRpc: (options: UpdateNetworkRpc) => Promise<void>;

  page: Page;
};
