import { Page } from 'playwright-core';

import { waitForChromeState } from '../../../helpers';
import { performPopupAction } from './util';

export const approve = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await connect(popup);
    await waitForChromeState(page);
  });
};

export const connect = async (popup: Page): Promise<void> => {
  // Wait for popup to load
  await popup.waitForLoadState();
  await popup.bringToFront();

  // Select first account
  await popup.getByTestId('edit').first().click();
  await popup.locator('.multichain-account-list-item').first().locator('input[type="checkbox"]').first().check();
  await popup.getByTestId('connect-more-accounts-button').click();

  // Go through the prompts
  await popup.getByTestId('confirm-btn').click();
};
