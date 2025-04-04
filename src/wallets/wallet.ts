import { Page } from 'playwright-core';
import { AddNetwork, AddToken, Dappwright, OfficialOptions, TransactionOptions } from '../types';
import { Step, WalletIdOptions, WalletOptions } from './wallets';

export default abstract class Wallet implements Dappwright {
  version: string;
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Name of the wallet
  static id: WalletIdOptions;
  static recommendedVersion: string;
  static releasesUrl: string;
  static homePath: string;

  // Extension downloader
  static download: (options: OfficialOptions) => Promise<string>;

  // Setup
  abstract setup: (options?: WalletOptions, steps?: Step<WalletOptions>[]) => Promise<void>;
  abstract defaultSetupSteps: Step<WalletOptions>[];

  // Wallet actions
  abstract addNetwork: (options: AddNetwork) => Promise<void>;
  abstract addToken: (options: AddToken) => Promise<void>;
  abstract approve: () => Promise<void>;
  abstract createAccount: (name?: string) => Promise<void>;
  abstract confirmNetworkSwitch: () => Promise<void>;
  abstract confirmTransaction: (options?: TransactionOptions) => Promise<void>;
  abstract countAccounts: () => Promise<number>;
  abstract deleteAccount: (name: string) => Promise<void>;
  abstract deleteNetwork: (name: string) => Promise<void>;
  abstract getTokenBalance: (tokenSymbol: string) => Promise<number>;
  abstract hasNetwork: (name: string) => Promise<boolean>;
  abstract importPK: (pk: string) => Promise<void>;
  abstract lock: () => Promise<void>;
  abstract reject: () => Promise<void>;
  abstract sign: () => Promise<void>;
  abstract signin: () => Promise<void>;
  abstract switchAccount: (name: string) => Promise<void>;
  abstract switchNetwork: (network: string) => Promise<void>;
  abstract unlock: (password?: string) => Promise<void>;
}
