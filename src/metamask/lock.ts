import { Page } from 'playwright-core';

import { clickOnButton, openProfileDropdown } from '../helpers';

export const lock =
  (
    page: Page,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    version?: string,
  ) =>
  async (): Promise<void> => {
    await page.bringToFront();

    await openProfileDropdown(page);
    await clickOnButton(page, 'Lock');
  };
