import { Page } from 'playwright-core';
import { openAccountMenu } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const switchAccount =
  (page: Page) =>
  async (accountNumber: number): Promise<void> => {
    await page.bringToFront();
    await openAccountMenu(page);

    await page
      .getByRole('dialog')
      .getByRole('button', { name: `Account ${accountNumber}`, exact: true })
      .click();
  };
