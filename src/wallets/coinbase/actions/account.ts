import { Page } from 'playwright-core';
import { waitForChromeState } from '../../../helpers';

export const countAccounts = (page: Page) => async (): Promise<number> => {
  await page.getByTestId('wallet-switcher--dropdown').click();
  const count = await page.locator('//*[@data-testid="wallet-switcher--dropdown"]/*/*[2]/*').count();
  await page.getByTestId('wallet-switcher--dropdown').click();
  return count;
};

export const createAccount =
  (page: Page) =>
  async (name?: string): Promise<void> => {
    if (name) {
      // eslint-disable-next-line no-console
      console.warn('parameter "name" is not supported for Coinbase');
    }

    await page.getByTestId('portfolio-header--switcher-cell-pressable').click();
    await page.getByTestId('wallet-switcher--manage').click();
    await page.getByTestId('manage-wallets-account-item--action-cell-pressable').click();

    // Help prompt appears once
    try {
      await page.getByTestId('add-new-wallet--continue').click({ timeout: 2000 });
    } catch {
      // Ignore missing help prompt
    }

    await waitForChromeState(page);
  };

export const switchAccount =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.getByTestId('portfolio-header--switcher-cell-pressable').click();

    const nameRegex = new RegExp(`${name} \\$`);
    await page.getByRole('button', { name: nameRegex }).click();
  };

export const deleteAccount = async (_: string): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('deleteAccount not implemented - Coinbase does not support importing/removing additional private keys');
};

export const importPK = async (_: string): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('importPK not implemented - Coinbase does not support importing/removing private keys');
};
