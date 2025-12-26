import { expect } from '@playwright/test';
import { Page } from 'playwright-core';
import { clickOnButton, typeOnInputField, waitForChromeState } from '../../../helpers';
import { accountList, accountListItem, clickBackButton, getErrorMessage, openAccountMenu } from './helpers';

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

export const deleteAccount =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    await accountListItem(page, name).getByTestId('multichain-account-cell-end-accessory').click();
    await page.getByLabel('Account details').click();
    await page.getByTestId('account-details-row-remove-account').click();
    await page.getByRole('button', { name: 'Remove', exact: true }).click();

    await waitForChromeState(page);
  };

export const switchAccount =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    await accountListItem(page, name).click();
  };

export const countAccounts = (_: Page) => async (): Promise<number> => {
  // eslint-disable-next-line no-console
  console.warn('countAccounts not yet implemented');
  return -1;
};

export const importPk =
  (page: Page) =>
  async (privateKey: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    // MetaMask account syncing can take a very long time.
    await page.getByTestId('account-list-add-wallet-button').click();
    await page.getByTestId('add-wallet-modal-import-account').click();

    await typeOnInputField(page, 'Enter your private key string here:', privateKey);
    await page.getByTestId('import-account-confirm-button').click();

    const errorMessage = await getErrorMessage(page);
    if (errorMessage) {
      await clickOnButton(page, 'Cancel');
      await clickBackButton(page);
      throw new SyntaxError(errorMessage);
    }

    await clickBackButton(page);
  };
