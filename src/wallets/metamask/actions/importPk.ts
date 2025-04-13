import { Page } from 'playwright-core';

import { clickOnButton, typeOnInputField } from '../../../helpers';
import { getErrorMessage, openAccountMenu } from './helpers';

export const importPk =
  (page: Page) =>
  async (privateKey: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    await page.getByTestId('multichain-account-menu-popover-action-button').click();

    await page.getByTestId('multichain-account-menu-popover-add-imported-account').click();
    await typeOnInputField(page, 'your private key', privateKey);
    await page.getByTestId('import-account-confirm-button').click();

    const errorMessage = await getErrorMessage(page);
    if (errorMessage) {
      await clickOnButton(page, 'Cancel');
      await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click();
      throw new SyntaxError(errorMessage);
    }
  };
