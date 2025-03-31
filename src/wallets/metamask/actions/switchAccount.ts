import { Page } from 'playwright-core';
import { openAccountMenu } from './helpers';

export const switchAccount =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    await page.getByRole('dialog').getByRole('button', { name, exact: true }).click();
  };
