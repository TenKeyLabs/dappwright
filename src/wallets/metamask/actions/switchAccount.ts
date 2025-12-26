import { Page } from 'playwright-core';
import { openAccountMenu } from './helpers';
import { accountListItem } from './util';

export const switchAccount =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    await accountListItem(page, name).click();
  };
