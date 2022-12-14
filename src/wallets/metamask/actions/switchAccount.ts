import { Page } from 'playwright-core';
import { clickOnElement } from '../../../helpers';
import { openProfileDropdown } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const switchAccount =
  (page: Page) =>
  async (accountNumber: number): Promise<void> => {
    await page.bringToFront();
    await page.waitForTimeout(500); // TODO: waiting for other states didn't work
    await openProfileDropdown(page);

    // TODO: use different approach? maybe change param to account name
    await clickOnElement(page, `Account ${accountNumber}`);
  };
