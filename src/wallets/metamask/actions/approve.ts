import { Page } from 'playwright-core';

import { clickOnButton } from '../../../helpers';
import { performPopupAction } from './util';

// TODO: thing about renaming this method?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const approve = (page: Page, version?: string) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await popup.waitForLoadState();
    await popup.bringToFront();
    // await popup.reload();

    // TODO: step 1 of connect chose account to connect?
    await popup.locator('input[type="checkbox"]').first().check(); // Select all accounts
    await clickOnButton(popup, 'Next');
    await clickOnButton(popup, 'Connect');
    await popup.close();
  });
};
