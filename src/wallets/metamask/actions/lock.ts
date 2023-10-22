import { Page } from 'playwright-core';

import { clickOnButton } from '../../../helpers';
import { openAccountOptionsMenu } from './helpers';

export const lock = (page: Page) => async (): Promise<void> => {
  await page.bringToFront();

  await openAccountOptionsMenu(page);
  await clickOnButton(page, 'Lock MetaMask');
};
