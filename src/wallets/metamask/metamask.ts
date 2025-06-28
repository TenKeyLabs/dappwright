import downloader from '../../downloader/downloader';
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
  reject,
  sign,
  signin,
  switchAccount,
  switchNetwork,
  unlock,
} from './actions';
import { confirmNetworkSwitch } from './actions/confirmNetworkSwitch';
import { countAccounts } from './actions/countAccounts';
import { hasNetwork } from './actions/hasNetwork';
import { setup } from './setup';
import {
  adjustSettings,
  clearOnboardingHelp,
  closePopup,
  closeSolanaPopup,
  createPassword,
  goToSettings,
  importAccount,
} from './setup/setupActions';

export class MetaMaskWallet extends Wallet {
  static id = 'metamask' as WalletIdOptions;
  static recommendedVersion = '12.17.3';
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
    closeSolanaPopup,
    closePopup,
    goToSettings,
    adjustSettings,
  ];
  setup = setup(this.page, this.defaultSetupSteps);

  // Actions
  addNetwork = addNetwork(this.page);
  addToken = addToken(this.page);
  approve = approve(this.page);
  createAccount = createAccount(this.page);
  confirmNetworkSwitch = confirmNetworkSwitch(this.page);
  confirmTransaction = confirmTransaction(this.page);
  countAccounts = countAccounts(this.page);
  deleteAccount = deleteAccount(this.page);
  deleteNetwork = deleteNetwork(this.page);
  getTokenBalance = getTokenBalance(this.page);
  hasNetwork = hasNetwork(this.page);
  importPK = importPk(this.page);
  lock = lock(this.page);
  reject = reject(this.page);
  sign = sign(this.page);
  signin = signin(this.page);
  switchAccount = switchAccount(this.page);
  switchNetwork = switchNetwork(this.page);
  unlock = unlock(this.page);
}
