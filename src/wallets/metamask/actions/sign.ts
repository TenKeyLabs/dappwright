import { Page } from 'playwright-core';

import { performPopupAction } from './util';

export const sign = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await popup.bringToFront();
    await popup.reload();

    await popup.getByTestId('confirm-footer-button').click();
  });
};
