import { Page } from 'playwright-core';
import { waitForChromeState } from '../../../helpers';
import { openAccountMenu } from './helpers';

export const createAccount = (page: Page) => async (): Promise<void> => {
  await page.bringToFront();
  await openAccountMenu(page);

  await page.getByTestId('multichain-account-menu-popover-action-button').click();
  await page.getByTestId('multichain-account-menu-popover-add-account').click();
  await page.getByRole('button', { name: 'Create' }).click();

  await waitForChromeState(page);
};
