import { Page } from 'playwright-core';

import { clickOnButton, clickOnElement, waitForChromeState } from '../../../helpers';
import { openAccountMenu } from './helpers';

export const deleteAccount =
  (page: Page) =>
  async (accountNumber: number): Promise<void> => {
    await page.bringToFront();

    if (accountNumber === 1) throw new SyntaxError('Account 1 cannot be deleted');

    await openAccountMenu(page);
    await page.getByRole('button', { name: `Account ${accountNumber} Options` }).click();
    await clickOnElement(page, 'Remove account');
    await clickOnButton(page, 'Remove');
    await waitForChromeState(page);
  };
