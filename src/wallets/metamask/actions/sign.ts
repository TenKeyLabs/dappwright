import { Page } from 'playwright-core';

import { clickOnButton } from '../../../helpers';

import { performPopupAction } from './util';

export const sign = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await popup.bringToFront();
    await popup.reload();

    await clickOnButton(popup, 'Sign');
  });
};
