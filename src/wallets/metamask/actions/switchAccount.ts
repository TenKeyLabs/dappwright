import { Page } from 'playwright-core';
import { clickOnElement } from '../../../helpers';
import { openAccountMenu } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const switchAccount =
  (page: Page) =>
  async (accountNumber: number): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    // TODO: use different approach? maybe change param to account name
    await clickOnElement(page, `Account ${accountNumber}`);
  };
