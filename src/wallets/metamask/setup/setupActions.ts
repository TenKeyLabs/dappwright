import { Page } from 'playwright-core';

import { clickOnButton, clickOnElement, typeOnInputField, waitForChromeState } from '../../../helpers';
import { WalletOptions } from '../../wallets';
import { clickOnLogo, clickOnSettingsSwitch, openNetworkDropdown } from '../actions/helpers';

export async function showTestNets(metamaskPage: Page): Promise<void> {
  await openNetworkDropdown(metamaskPage);

  await clickOnElement(metamaskPage, 'Show/hide');
  await clickOnSettingsSwitch(metamaskPage, 'Advanced gas controls');
  await clickOnSettingsSwitch(metamaskPage, 'Show test networks');
  await clickOnLogo(metamaskPage);
  await waitForChromeState(metamaskPage);
}

export async function importWallet(metamaskPage: Page): Promise<void> {
  await metamaskPage.getByTestId('onboarding-import-wallet').click();
  await metamaskPage.getByTestId('import-srp-confirm').click();
  await metamaskPage.getByTestId('create-password-new').fill('sdfsdf');
  await metamaskPage.getByTestId('create-password-confirm').click();
  await metamaskPage.getByTestId('create-password-confirm').fill('sdfsdfs');
  await metamaskPage.getByTestId('create-password-new').dblclick();
  await metamaskPage.getByTestId('create-password-new').fill('10keylabs');
  await metamaskPage.getByTestId('create-password-new').press('Tab');
  await metamaskPage.getByTestId('create-password-confirm').fill('10keylabs');
  await metamaskPage.getByTestId('create-password-import').click();
  await metamaskPage.getByTestId('onboarding-complete-done').click();
  await metamaskPage.getByTestId('pin-extension-next').click();
  await metamaskPage.getByTestId('pin-extension-done').click();
}

export async function noThanksTelemetry(metamaskPage: Page): Promise<void> {
  await clickOnButton(metamaskPage, 'No thanks');
}

export async function importAccount(
  metamaskPage: Page,
  { seed = 'already turtle birth enroll since owner keep patch skirt drift any dinner' }: WalletOptions,
): Promise<void> {
  await metamaskPage.getByTestId('onboarding-import-wallet').click();
  await metamaskPage.getByTestId('metametrics-i-agree').click();

  for (const [index, seedPart] of seed.split(' ').entries())
    await typeOnInputField(metamaskPage, `${index + 1}.`, seedPart);

  await metamaskPage.getByTestId('import-srp-confirm').click();
}

export async function createPassword(metamaskPage: Page, { password = 'password1234' }: WalletOptions): Promise<void> {
  await metamaskPage.getByTestId('create-password-new').fill(password);
  await metamaskPage.getByTestId('create-password-confirm').fill(password);
  await metamaskPage.getByTestId('create-password-terms').click();
  await metamaskPage.getByTestId('create-password-import').click();
}

export async function clearOnboardingHelp(metamaskPage: Page): Promise<void> {
  await metamaskPage.getByTestId('onboarding-complete-done').click();
  await metamaskPage.getByTestId('pin-extension-next').click();
  await metamaskPage.getByTestId('pin-extension-done').click();
}

export const closePopup = async (page: Page): Promise<void> => {
  /* For some reason popup deletes close button and then create new one (react stuff)
   * hacky solution can be found here => https://github.com/puppeteer/puppeteer/issues/3496 */
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (await page.locator('.popover-header__button').isVisible()) {
    await page.$eval('.popover-header__button', (node: HTMLElement) => node.click());
  }
};
