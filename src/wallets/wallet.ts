import { Page } from 'playwright-core';
import { AddNetwork, AddToken, Dappwright, OfficialOptions, TransactionOptions } from '../types';
import { Step, WalletIdOptions, WalletOptions } from './wallets';

export default abstract class Wallet implements Dappwright {
  version: string;
  page: Page;

  // abstract options: WalletOptions;

  constructor(page: Page) {
    this.page = page;
  }

  // Name of the wallet
  static id: WalletIdOptions;
  static recommendedVersion: string;

  // Extension downloader
  static download: (options: OfficialOptions) => Promise<string>;

  // Setup
  abstract setup: (options?: WalletOptions, steps?: Step<WalletOptions>[]) => Promise<void>;

  // Wallet actions
  abstract lock: () => Promise<void>;
  abstract unlock: (password?: string) => Promise<void>;
  abstract addNetwork: (options: AddNetwork) => Promise<void>;
  abstract addToken: (options: AddToken) => Promise<void>;
  abstract createAccount: () => Promise<void>;
  abstract importPK: (pk: string) => Promise<void>;
  abstract switchAccount: (accountNumber: number) => Promise<void>;
  abstract switchNetwork: (network: string) => Promise<void>;
  abstract confirmTransaction: (options?: TransactionOptions) => Promise<void>;
  abstract sign: () => Promise<void>;
  abstract approve: () => Promise<void>;
  abstract getTokenBalance: (tokenSymbol: string) => Promise<number>;
  abstract deleteAccount: (accountNumber: number) => Promise<void>;
  abstract deleteNetwork: (name: string) => Promise<void>;
}
