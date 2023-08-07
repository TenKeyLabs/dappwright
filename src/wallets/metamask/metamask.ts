import Wallet from '../wallet';
import { Step, WalletIdOptions, WalletOptions } from '../wallets';
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
import { allowNetworkSwitch as confirmNetworkSwitch } from './actions/allowNetworkSwitch';
import { hasNetwork } from './actions/hasNetwork';
import { setup } from './setup';
import downloader from './setup/downloader';
import { clearOnboardingHelp, closePopup, createPassword, importAccount, showTestNets } from './setup/setupActions';

export class MetaMaskWallet extends Wallet {
  static id = 'metamask' as WalletIdOptions;
  static recommendedVersion = '10.25.0';
  static releasesUrl = 'https://api.github.com/repos/metamask/metamask-extension/releases';
  static homePath = '/home.html';

  options: WalletOptions;

  // Extension Downloader
  static download = downloader(this.id, this.releasesUrl, this.recommendedVersion);

  // Setup
  defaultSetupSteps: Step<WalletOptions>[] = [
    importAccount,
    createPassword,
    clearOnboardingHelp,
    closePopup,
    showTestNets,
  ];
  setup = setup(this.page, this.defaultSetupSteps);

  // Actions
  addNetwork = addNetwork(this.page);
  addToken = addToken(this.page);
  approve = approve(this.page);
  createAccount = createAccount(this.page);
  confirmNetworkSwitch = confirmNetworkSwitch(this.page);
  confirmTransaction = confirmTransaction(this.page);
  countAccounts = this.countAccounts(this.page);
  deleteAccount = deleteAccount(this.page);
  deleteNetwork = deleteNetwork(this.page);
  getTokenBalance = getTokenBalance(this.page);
  hasNetwork = hasNetwork(this.page);
  importPK = importPk(this.page);
  lock = lock(this.page);
  sign = sign(this.page);
  switchAccount = switchAccount(this.page);
  switchNetwork = switchNetwork(this.page);
  unlock = unlock(this.page);
}
