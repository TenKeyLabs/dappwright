import { Page } from 'playwright-core';
import Wallet from '../wallet';
import { WalletIdOptions, WalletOptions } from '../wallets';
import {
  addNetwork,
  addToken,
  approve,
  confirmTransaction,
  createAccount,
  deleteAccount,
  deleteNetwork,
  getTokenBalance,
  importPk,
  lock,
  sign,
  switchAccount,
  switchNetwork,
  unlock,
} from './actions';
import { setup } from './setup';
import downloader from './setup/downloader';

export class MetaMaskWallet extends Wallet {
  static recommendedVersion = '10.20.0';
  static id = 'metamask' as WalletIdOptions;

  options: WalletOptions;

  constructor(page: Page) {
    super(page);
  }

  addNetwork = addNetwork(this.page);
  approve = approve(this.page);
  confirmTransaction = confirmTransaction(this.page);
  createAccount = createAccount(this.page);
  importPK = importPk(this.page);
  lock = lock(this.page);
  sign = sign(this.page);
  switchAccount = switchAccount(this.page);
  switchNetwork = switchNetwork(this.page);
  unlock = unlock(this.page);
  addToken = addToken(this.page);
  deleteAccount = deleteAccount(this.page);
  deleteNetwork = deleteNetwork(this.page);
  getTokenBalance = getTokenBalance(this.page);
  setup = setup(this.page);

  static download = downloader(this.recommendedVersion);
}
