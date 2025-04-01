import { Page } from 'playwright-core';

import { clickOnButton, clickOnElement, waitForChromeState } from '../../../helpers';
import { openAccountMenu } from './helpers';

export const deleteAccount =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    await page.getByRole('button', { name: `${name} Options` }).click();
    await clickOnElement(page, 'Remove account');
    await clickOnButton(page, 'Remove');

    await waitForChromeState(page);
  };
