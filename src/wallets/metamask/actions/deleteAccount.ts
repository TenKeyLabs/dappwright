import { Page } from 'playwright-core';

import { waitForChromeState } from '../../../helpers';
import { openAccountMenu } from './helpers';
import { accountListItem } from './util';

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
