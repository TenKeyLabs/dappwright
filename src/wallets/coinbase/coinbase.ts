import { setup } from '../metamask/setup';
import downloader from '../metamask/setup/downloader';
import Wallet from '../wallet';
import { Step, WalletIdOptions, WalletOptions } from '../wallets';
import {
  addNetwork,
  addToken,
  approve,
  confirmNetworkSwitch,
  confirmTransaction,
  createAccount,
  deleteAccount,
  deleteNetwork,
  getStarted,
  getTokenBalance,
  hasNetwork,
  importPK,
  lock,
  navigateHome,
  sign,
  switchAccount,
  switchNetwork,
  unlock,
} from './actions';

export class CoinbaseWallet extends Wallet {
  static id = 'coinbase' as WalletIdOptions;
  static recommendedVersion = '3.14.2';
  static releasesUrl = 'https://api.github.com/repos/TenKeyLabs/coinbase-wallet-archive/releases';
  static homePath = '/index.html';

  options: WalletOptions;

  // Extension Downloader
  static download = downloader(this.id, this.releasesUrl, this.recommendedVersion);

  // Setup
  defaultSetupSteps: Step<WalletOptions>[] = [getStarted, navigateHome];
  setup = setup(this.page, this.defaultSetupSteps);

  // Actions
  addNetwork = addNetwork(this.page);
  addToken = addToken;
  approve = approve(this.page);
  createAccount = createAccount(this.page);
  confirmNetworkSwitch = confirmNetworkSwitch;
  confirmTransaction = confirmTransaction(this.page);
  deleteAccount = deleteAccount;
  deleteNetwork = deleteNetwork(this.page);
  getTokenBalance = getTokenBalance(this.page);
  hasNetwork = hasNetwork(this.page);
  importPK = importPK;
  lock = lock(this.page);
  sign = sign(this.page);
  switchAccount = switchAccount(this.page);
  switchNetwork = switchNetwork;
  unlock = unlock(this.page);
}
