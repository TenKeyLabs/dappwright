import downloader from '../../downloader/downloader';
import { setup } from '../metamask/setup';
import Wallet from '../wallet';
import { Step, WalletIdOptions, WalletOptions } from '../wallets';
import {
  addNetwork,
  addToken,
  approve,
  confirmNetworkSwitch,
  confirmTransaction,
  countAccounts,
  createAccount,
  deleteAccount,
  deleteNetwork,
  getTokenBalance,
  hasNetwork,
  importPk,
  lock,
  reject,
  sign,
  signin,
  switchAccount,
  switchNetwork,
  unlock,
  updateNetworkRpc,
} from './actions';
import { getStarted, navigateHome } from './setup';

export class CoinbaseWallet extends Wallet {
  static id = 'coinbase' as WalletIdOptions;
  static recommendedVersion = '3.123.0';
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
  countAccounts = countAccounts(this.page);
  deleteAccount = deleteAccount;
  deleteNetwork = deleteNetwork(this.page);
  getTokenBalance = getTokenBalance(this.page);
  hasNetwork = hasNetwork(this.page);
  importPK = importPk;
  lock = lock(this.page);
  reject = reject(this.page);
  sign = sign(this.page);
  signin = signin;
  switchAccount = switchAccount(this.page);
  switchNetwork = switchNetwork;
  unlock = unlock(this.page);
  updateNetworkRpc = updateNetworkRpc;
}
