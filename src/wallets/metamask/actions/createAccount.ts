import { Page } from 'playwright-core';
import { clickOnButton, clickOnElement, waitForChromeState } from '../../../helpers';
import { openProfileDropdown } from './helpers';

export const createAccount = (page: Page) => async (): Promise<void> => {
  await page.bringToFront();
  await openProfileDropdown(page);

  // TODO: use different approach? maybe change param to account name
  await clickOnElement(page, `Create account`);
  await clickOnButton(page, `Create`);
  await waitForChromeState(page);
};
