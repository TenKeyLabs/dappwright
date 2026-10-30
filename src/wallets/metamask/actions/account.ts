import { expect } from '@playwright/test';
import { Page } from 'playwright-core';
import {
  accountList,
  accountListItem,
  clickBackButton,
  errorMessage,
  goHome,
  openAccountMenu,
  waitForSelectedAccount,
} from './helpers';

// A row's centre can land on its address menu, so select an account by clicking its name
const accountNameRegex = /^multichain-account-cell-name-/;

export const createAccount =
  (page: Page) =>
  async (name?: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    const accountCount = await accountList(page).count();
    await page.getByTestId('add-multichain-account-button').click();
    await expect(accountList(page)).toHaveCount(accountCount + 1);

    // Accounts are grouped by wallet with imported accounts listed after the recovery phrase
    // wallet, so the new account is the last one derived from the phrase rather than the last row
    const newAccount = page.getByTestId(/^multichain-account-cell-entropy:/).last();

    if (name) {
      await newAccount.getByTestId('multichain-account-cell-end-accessory').click();
      await page.getByLabel('Rename').click();
      await page.getByTestId('account-name-input').getByRole('textbox').fill(name);
      await page.getByTestId('account-name-confirm-button').click();
    }

    const newAccountName = newAccount.getByTestId(accountNameRegex);
    const selectedName = name ?? (await newAccountName.innerText());
    await newAccountName.click();

    await waitForSelectedAccount(page, selectedName);
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

    // Removing routes home before the background has finished, so confirm the account has left the list
    await openAccountMenu(page);
    await accountListItem(page, name).waitFor({ state: 'hidden' });
    await clickBackButton(page);
  };

export const switchAccount =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    await accountListItem(page, name).getByTestId(accountNameRegex).click();
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
    await page.getByTestId('choose-wallet-type-import-account').click();

    await page.getByLabel('Enter your private key string here:').fill(privateKey);
    await page.getByTestId('import-account-confirm-button').click();

    // A successful import returns to home on its own, while a rejected key stays on the form
    const error = errorMessage(page);
    await error.or(page.getByTestId('account-options-menu-button')).first().waitFor();
    if (await error.isVisible()) {
      const message = await error.innerText();
      await goHome(page);
      throw new SyntaxError(message);
    }
  };
