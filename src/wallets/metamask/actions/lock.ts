import { Page } from 'playwright-core';

import { openAccountOptionsMenu } from './helpers';

export const lock = (page: Page) => async (): Promise<void> => {
  await page.bringToFront();

  await openAccountOptionsMenu(page);
  await page.getByTestId('global-menu-lock').click();
};
