import { Page } from 'playwright-core';

import { clickOnButton } from '../../../helpers';
import { openProfileDropdown } from './helpers';

export const lock = (page: Page) => async (): Promise<void> => {
  await page.bringToFront();

  await openProfileDropdown(page);
  await clickOnButton(page, 'Lock');
};
