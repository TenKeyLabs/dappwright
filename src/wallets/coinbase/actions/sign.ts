import { Page } from 'playwright-core';

import { performPopupAction } from './util';

export const sign = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page) => {
    await popup.getByTestId('sign-message').click();
  });
};
