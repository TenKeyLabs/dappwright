import { Page } from 'playwright-core';

import { clickOnButton, typeOnInputField } from '../../../helpers';
import { getErrorMessage, openAccountMenu } from './helpers';
import { accountSyncTimeout, clickBackButton } from './util';

export const importPk =
  (page: Page) =>
  async (privateKey: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    // MetaMask account syncing can take a very long time.
    await page.getByTestId('account-list-add-wallet-button').click({ timeout: accountSyncTimeout });
    await page.getByTestId('add-wallet-modal-import-account').click();
    // await page.getByTestId('srp-input-import__srp-note').fill(privateKey);
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
