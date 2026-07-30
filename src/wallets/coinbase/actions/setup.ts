import { Page } from 'playwright-core';
import { waitForChromeState } from '../../../helpers';
import { WalletOptions } from '../../wallets';
import { goHome } from './helpers';

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

  // The recovery phrase warning modal only renders if the import screen has
  // settled before we click through - clicking it mid-transition lands on the
  // import screen with no modal at all. Wait for the screen, then dismiss the
  // modal only if it actually showed up, otherwise we block until the fixture
  // times out waiting for a button that is never coming.
  await page.getByTestId('secret-input').waitFor();
  await page
    .getByRole('button', { name: 'Acknowledge' })
    .click({ timeout: 5000 })
    .catch(() => undefined);

  await page.getByTestId('secret-input').fill(seed);
  await page.getByTestId('btn-import-wallet').click();
  await page.getByTestId('setPassword').fill(password);
  await page.getByTestId('setPasswordVerify').fill(password);
  await page.getByTestId('terms-and-privacy-policy').check();
  await page.getByTestId('btn-password-continue').click();

  // Allow extension state/settings to settle
  await waitForChromeState(page);
}

export const signin = async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('signin not implemented');
};

export const lock = (page: Page) => async (): Promise<void> => {
  await page.getByTestId('settings-navigation-link').click();
  await page.getByTestId('lock-wallet-button').click();
};

export const unlock =
  (page: Page) =>
  async (password = 'password1234!!!!'): Promise<void> => {
    // last() because it seems to be a rendering issue of some sort
    await page.getByTestId('unlock-with-password').last().fill(password);
    await page.getByTestId('unlock-wallet-button').last().click();

    // Go back home since wallet returns to last visited page when unlocked.
    await goHome(page);

    // Wait for homescreen data to load
    await page.waitForSelector("//div[@data-testid='asset-list']//*[not(text='')]", { timeout: 10000 });
  };
