import { Page } from 'playwright-core';

import { WalletOptions } from '../../wallets';
import { goHome, goToSettings, openNetworkSettings, setSettingsSwitch } from '../actions/helpers';

export async function importAccount(
  metamaskPage: Page,
  { seed = 'already turtle birth enroll since owner keep patch skirt drift any dinner' }: WalletOptions,
): Promise<void> {
  await metamaskPage.getByTestId('onboarding-import-wallet').click();
  await metamaskPage.getByTestId('onboarding-import-with-srp-button').click();
  await metamaskPage.getByTestId('srp-input-import__srp-note').pressSequentially(seed);
  await metamaskPage.getByTestId('import-srp-confirm').click();
}

export async function createPassword(metamaskPage: Page, { password = 'password1234' }: WalletOptions): Promise<void> {
  await metamaskPage.getByTestId('create-password-new-input').fill(password);
  await metamaskPage.getByTestId('create-password-confirm-input').fill(password);
  await metamaskPage.getByTestId('create-password-terms').click();
  await metamaskPage.getByTestId('create-password-submit').click();
}

export async function doOnboarding(metamaskPage: Page, { password = 'password1234' }: WalletOptions): Promise<void> {
  await metamaskPage.getByTestId('passkey-maybe-later-button').click();
  await metamaskPage.getByTestId('metametrics-checkbox').click();
  await metamaskPage.getByTestId('metametrics-i-agree').click();
  await metamaskPage.getByTestId('manage-default-settings').click();
  await metamaskPage.getByTestId('category-item-Backup and sync').click();
  await setSettingsSwitch(metamaskPage, 'backup-and-sync-toggle-button', false);
  await metamaskPage.getByTestId('category-back-button').click();
  await metamaskPage.getByTestId('privacy-settings-back-button').click();
  await metamaskPage.getByTestId('onboarding-complete-done').click();
  await waitForOnboardingComplete(metamaskPage, password);
}

/* Done saves each onboarding choice in the background one after another, and reloading part way
 * through drops the rest. Without the side panel it then routes home. With it, Done disables itself
 * once the panel opens, after the choices are saved but before onboarding is marked complete, so a
 * reload can still land on the unlock screen. Unlocking there lets MetaMask finish onboarding itself. */
async function waitForOnboardingComplete(metamaskPage: Page, password: string): Promise<void> {
  const home = metamaskPage.getByTestId('account-options-menu-button');
  const doneButton = metamaskPage.getByTestId('onboarding-complete-done');
  await home.or(doneButton.and(metamaskPage.locator(':disabled'))).waitFor();

  await metamaskPage.goto(metamaskPage.url().split('#')[0]);

  const unlockInput = metamaskPage.getByTestId('unlock-password');
  await home.or(unlockInput).waitFor();
  if (await unlockInput.isVisible()) {
    await unlockInput.fill(password);
    await metamaskPage.getByTestId('unlock-submit').click();
    await home.waitFor();
  }
}

const pagesDismissingPopups = new WeakSet<Page>();

/* MetaMask opens its popups at no particular time, so instead of pausing to look for one, have
 * Playwright dismiss it whenever it gets in the way of an action. A page gets a new wallet instance
 * each time getWallet is called, but only needs the handlers once. */
export const dismissPopups = (page: Page): void => {
  if (pagesDismissingPopups.has(page)) return;
  pagesDismissingPopups.add(page);

  for (const popup of [page.getByTestId('popover-close'), page.getByRole('button', { name: 'Not now' })]) {
    page.addLocatorHandler(popup, (dismiss) => dismiss.click()).catch(() => undefined);
  }

  // MetaMask shows this in place of the wallet if its background is silent for 15 seconds, and stays on
  // it even once the background has started, but loads normally from then on
  page.addLocatorHandler(page.getByText('MetaMask had trouble starting.'), () => page.reload()).catch(() => undefined);
};

export async function adjustSettings(metamaskPage: Page): Promise<void> {
  await goToSettings(metamaskPage);
  await setSettingsSwitch(metamaskPage, 'show-extension-in-full-size-view', true);
  await metamaskPage.getByTestId('page-header-back-button').click();

  await openNetworkSettings(metamaskPage);
  await setSettingsSwitch(metamaskPage, 'networks-page-show-test-networks', true);

  await goHome(metamaskPage);
}
