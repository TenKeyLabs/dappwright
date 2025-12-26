import { expect } from '@playwright/test';
import { Page } from 'playwright-core';
import { waitForChromeState } from '../../../helpers';
import { openAccountMenu } from './helpers';
import { accountList } from './util';

export const createAccount =
  (page: Page) =>
  async (name?: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    const accountCount = await accountList(page).count();
    await page.getByTestId('add-multichain-account-button').click();
    await expect(accountList(page)).toHaveCount(accountCount + 1);

    if (name) {
      await page.getByTestId('multichain-account-cell-end-accessory').last().click();
      await page.getByLabel('Rename').click();
      await page.getByTestId('account-name-input').getByRole('textbox').fill(name);
      await page.getByLabel('Confirm').click();
    }

    await accountList(page).last().click();

    await waitForChromeState(page);
  };
