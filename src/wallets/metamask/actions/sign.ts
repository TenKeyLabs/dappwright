import { Page } from 'playwright-core';

import { clickOnButton } from '../../../helpers';

import { performPopupAction } from './util';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sign = (page: Page, version?: string) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await popup.bringToFront();
    await popup.reload();

    await clickOnButton(popup, 'Sign');
  });
};
