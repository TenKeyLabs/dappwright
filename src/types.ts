import { Page } from 'playwright-core';
import { RECOMMENDED_METAMASK_VERSION } from './setup/constants';
import { Path } from './setup/metamaskDownloader';

export type LaunchOptions = OfficialOptions | CustomOptions;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DappwrightBrowserLaunchArgumentOptions = Omit<any, 'headed'>;

export type DappwrightConfig = Partial<{
  dappwright: LaunchOptions;
  metamask: MetamaskOptions;
}>;

export type OfficialOptions = DappwrightBrowserLaunchArgumentOptions & {
  metamaskVersion: typeof RECOMMENDED_METAMASK_VERSION | 'latest' | string;
  metamaskLocation?: Path;
};

export type CustomOptions = DappwrightBrowserLaunchArgumentOptions & {
  metamaskVersion?: string;
  metamaskPath: string;
};

export type MetamaskOptions = {
  seed?: string;
  password?: string;
  showTestNets?: boolean;
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
  helpers: {
    getTokenBalance: (tokenSymbol: string) => Promise<number>;
    deleteAccount: (accountNumber: number) => Promise<void>;
    deleteNetwork: (name: string) => Promise<void>;
  };
  page: Page;
};
