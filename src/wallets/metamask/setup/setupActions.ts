import { Page } from 'playwright-core';

import { waitForChromeState } from '../../../helpers';
import { WalletOptions } from '../../wallets';
import { clickOnSettingsSwitch, goToSettings } from '../actions/helpers';

export async function importAccount(
  metamaskPage: Page,
  { seed = 'already turtle birth enroll since owner keep patch skirt drift any dinner' }: WalletOptions,
): Promise<void> {
  await metamaskPage.getByTestId('onboarding-import-wallet').click();
  await metamaskPage.getByTestId('onboarding-import-with-srp-button').click();
  await metamaskPage.getByTestId('srp-input-import__srp-note').pressSequentially(seed, { delay: 30 });
  // Commit the final word so MetaMask validates the full SRP and enables the
  // Continue button. Without a trailing separator the last word can stay
  // uncommitted and `import-srp-confirm` remains disabled (seen on MetaMask
  // 13.17.0), making the click below time out.
  //
  // Use the global keyboard rather than `locator.press` on the SRP field:
  // after `pressSequentially` the focus is already on that input, and the
  // `srp-input-import__srp-note` testid is no longer re-locatable at this
  // point, so a locator-based press times out waiting for the element.
  await metamaskPage.keyboard.press('Space');
  await metamaskPage.getByTestId('import-srp-confirm').click();
}

export async function createPassword(metamaskPage: Page, { password = 'password1234' }: WalletOptions): Promise<void> {
  await metamaskPage.getByTestId('create-password-new-input').fill(password);
  await metamaskPage.getByTestId('create-password-confirm-input').fill(password);
  await metamaskPage.getByTestId('create-password-terms').click();
  await metamaskPage.getByTestId('create-password-submit').click();
}

export async function doOnboarding(metamaskPage: Page): Promise<void> {
  await metamaskPage.getByTestId('metametrics-checkbox').click();
  await metamaskPage.getByTestId('metametrics-i-agree').click();
  await metamaskPage.getByTestId('manage-default-settings').click();
  await metamaskPage.getByTestId('category-item-General').click();
  await metamaskPage.getByTestId('backup-and-sync-toggle-container').click();
  await metamaskPage.getByTestId('category-back-button').click();
  await metamaskPage.getByTestId('privacy-settings-back-button').click();
  await metamaskPage.getByTestId('onboarding-complete-done').click();
  await waitForChromeState(metamaskPage);
  await metamaskPage.goto(metamaskPage.url().split('#')[0]);
}

export const closePopup = async (page: Page): Promise<void> => {
  /* For some reason popup deletes close button and then create new one (react stuff)
   * hacky solution can be found here => https://github.com/puppeteer/puppeteer/issues/3496 */
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (await page.getByTestId('popover-close').isVisible()) {
    await page.getByTestId('popover-close').click();
  }
  const notNowButton = page.getByRole('button', { name: 'Not now' });
  if (await notNowButton.isVisible()) {
    await notNowButton.click();
  }
};

export async function adjustSettings(metamaskPage: Page): Promise<void> {
  await goToSettings(metamaskPage);

  await metamaskPage.locator('.tab-bar__tab', { hasText: 'Advanced' }).click();

  await clickOnSettingsSwitch(metamaskPage, 'Show test networks');
  await clickOnSettingsSwitch(metamaskPage, 'Show extension in full-size view');
  await metamaskPage.getByRole('button', { name: 'Close' }).click();

  await waitForChromeState(metamaskPage);
  await metamaskPage.reload({ waitUntil: 'domcontentloaded' });
}
