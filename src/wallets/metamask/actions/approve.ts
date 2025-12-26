import { Page } from 'playwright-core';

import { waitForChromeState } from '../../../helpers';
import { performSidepanelAction } from './util';

export const approve = (page: Page) => async (): Promise<void> => {
  await performSidepanelAction(page, async (popup) => {
    await clickConfirm(popup);
    await waitForChromeState(page);
  });
};

export const clickConfirm = async (popup: Page): Promise<void> => {
  await popup.getByTestId('confirm-btn').click();
};
