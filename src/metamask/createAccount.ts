import { Page } from 'playwright';

import { clickOnButton, clickOnElement, openProfileDropdown } from '../helpers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createAccount = (page: Page, version?: string) => async (): Promise<void> => {
  await page.bringToFront();
  await openProfileDropdown(page);

  // TODO: use different approach? maybe change param to account name
  await clickOnElement(page, `Create account`);
  await clickOnButton(page, `Create`);
};
