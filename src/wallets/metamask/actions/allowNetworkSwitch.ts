import { Page } from 'playwright-core';
import { clickOnButton, waitForChromeState } from '../../../helpers';
import { performPopupAction } from './util';

export const allowNetworkSwitch = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await clickOnButton(popup, 'Switch network');
    await waitForChromeState(page);
  });
};
