import { Page } from 'playwright-core';
import { waitForChromeState } from '../../../helpers';
import { openAccountMenu } from './helpers';

export const createAccount =
  (page: Page) =>
  async (name?: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    await page.getByTestId('multichain-account-menu-popover-action-button').click();
    await page.getByTestId('multichain-account-menu-popover-add-account').click();

    if (name) await page.getByLabel('Account name').fill(name);

    await page.getByRole('button', { name: 'Add account' }).click();

    await waitForChromeState(page);
  };
