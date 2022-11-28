import { Page } from 'playwright-core';

import { clickOnButton, waitForChromeState } from '../../../helpers';
import { performPopupAction } from './util';

export const approve = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    // Wait for popup to load
    await popup.waitForLoadState();
    await popup.bringToFront();

    // Select first account
    await popup.locator('input[type="checkbox"]').first().check();

    // Go through the prompts
    await clickOnButton(popup, 'Next');
    await clickOnButton(popup, 'Connect');

    // Wait and close
    await waitForChromeState(page);
    await popup.close();
  });
};
