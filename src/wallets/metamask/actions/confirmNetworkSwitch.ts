import { Page } from 'playwright-core';
import { waitForChromeState } from '../../../helpers';
import { performPopupAction } from './util';

export const confirmNetworkSwitch = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await popup.getByTestId('page-container-footer-next').click();
    await waitForChromeState(page);
  });
};
