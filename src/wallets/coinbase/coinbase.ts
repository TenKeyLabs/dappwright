import { Page } from 'playwright-core';
import { setup } from '../metamask/setup';
import downloader from '../metamask/setup/downloader';
import Wallet from '../wallet';
import { Step, WalletIdOptions, WalletOptions } from '../wallets';
import {
  addNetwork,
  approve,
  confirmTransaction,
  deleteNetwork,
  getStarted,
  getTokenBalance,
  hasNetwork,
  lock,
  sign,
  switchNetwork,
  unlock,
} from './actions';

export const extensionUrl = 'chrome-extension://hnfanknocfeofbddgcijnmhnfnkdnaad/index.html';

export class CoinbaseWallet extends Wallet {
  static id = 'coinbase' as WalletIdOptions;
  static recommendedVersion = '3.0.4';
  static releasesUrl = 'https://api.github.com/repos/osis/coinbase-wallet-archive/releases';
  static extensionUrl = 'chrome-extension://hnfanknocfeofbddgcijnmhnfnkdnaad/index.html';

  options: WalletOptions;

  constructor(page: Page) {
    super(page);
  }

  // Extension Downloader
  static download = downloader(this.id, this.releasesUrl, this.recommendedVersion);

  // Setup
  defaultSetupSteps: Step<WalletOptions>[] = [getStarted];
  setup = setup(this.page, this.defaultSetupSteps);

  // Actions
  addNetwork = addNetwork(this.page);
  addToken = async () => console.warn('addToken not implemented');
  approve = approve(this.page);
  createAccount = async () => console.warn('createAccount not Implemented');
  confirmNetworkSwitch = async () => {
    console.warn('confirmNetworkSwitch not implemented');
  };
  confirmTransaction = async () => confirmTransaction(this.page);
  deleteAccount = async () => console.warn('deleteAccount not implemented');
  deleteNetwork = deleteNetwork(this.page);
  getTokenBalance = getTokenBalance(this.page);
  hasNetwork = hasNetwork(this.page);
  importPK = async () => {
    throw SyntaxError('import pk not supported in coinbase wallet');
  };
  lock = lock(this.page);
  sign = sign(this.page);
  switchAccount = async () => console.warn('switchAccount not implemented');
  switchNetwork = async () => switchNetwork(this.page);
  unlock = unlock(this.page);
}
