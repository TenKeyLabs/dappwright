import { Page } from 'playwright-core';
import { waitForChromeState } from '../../../helpers';
import { performSidepanelAction } from './util';

export const confirmNetworkSwitch = (page: Page) => async (): Promise<void> => {
  await performSidepanelAction(page, async (popup) => {
    await popup.getByTestId('page-container-footer-next').click();
    await waitForChromeState(page);
  });
};
