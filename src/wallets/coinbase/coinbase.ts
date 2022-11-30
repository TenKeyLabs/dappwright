import { Page } from 'playwright-core';
import { AddNetwork } from '../../types';
import { performPopupAction } from '../metamask/actions';
import { setup } from '../metamask/setup';
import downloader from '../metamask/setup/downloader';
import Wallet from '../wallet';
import { Step, WalletIdOptions, WalletOptions } from '../wallets';

export async function getStarted(
  page: Page,
  {
    seed = 'already turtle birth enroll since owner keep patch skirt drift any dinner',
    password = 'password1234!!!!',
  }: WalletOptions,
): Promise<void> {
  // Welcome screen
  await page.getByTestId('btn-import-existing-wallet').click();

  // Import Wallet
  await page.getByTestId('btn-import-recovery-phrase').click();
  await page.getByTestId('seed-phrase-input').fill(seed);
  await page.getByTestId('btn-import-wallet').click();
  await page.getByTestId('setPassword').fill(password);
  await page.getByTestId('setPasswordVerify').fill(password);
  await page.getByTestId('terms-and-privacy-policy').check();
  await page.getByTestId('btn-password-continue').click();

  // Allow extension state/settings to settle
  await page.waitForTimeout(3000);

  // Open Home in tab
  await page.goto('chrome-extension://hnfanknocfeofbddgcijnmhnfnkdnaad/index.html');
}

export const approve = (page: Page) => async () => {
  await performPopupAction(page, async (popup: Page) => {
    await popup.getByTestId('allow-authorize-button').click();
    await popup.waitForTimeout(2000); // quitting too quickly causes failure
  });
};

export const sign = (page: Page) => async () => {
  await performPopupAction(page, async (popup: Page) => {
    await popup.getByTestId('sign-message').click();
    await popup.waitForTimeout(2000); // quitting too quickly causes failure
  });
};

export const unlock =
  (page: Page) =>
  async (password: string = 'password1234!!!!') => {
    await page.getByTestId('unlock-with-password').fill(password);
    await page.getByTestId('unlock-wallet-button').click();
  };

export class CoinbaseWallet extends Wallet {
  static recommendedVersion = '2.36.1';
  static id = 'coinbase' as WalletIdOptions;
  static releasesUrl = 'https://api.github.com/repos/osis/coinbase-wallet-versions/releases';

  options: WalletOptions;

  constructor(page: Page) {
    super(page);
  }

  defaultSetupSteps: Step<WalletOptions>[] = [getStarted];

  addNetwork = async (options: AddNetwork) => console.log('Not Implemented');
  approve = approve(this.page);
  createAccount = async () => console.log('Not Implemented');
  confirmTransaction = async () => console.log('Not Implemented');
  importPK = async () => console.log('Not Implemented');
  lock = async () => console.log('Not Implemented');
  sign = sign(this.page);
  switchAccount = async () => console.log('Not Implemented');
  switchNetwork = async () => console.log('Not Implemented');
  unlock = unlock(this.page);
  addToken = async () => console.log('Not Implemented');
  deleteAccount = async () => console.log('Not Implemented');
  deleteNetwork = async () => console.log('Not Implemented');
  getTokenBalance = async (tokenSymbol: string) => 0;
  setup = setup(this.page, this.defaultSetupSteps);

  static download = downloader(this.id, this.releasesUrl, this.recommendedVersion);
}
