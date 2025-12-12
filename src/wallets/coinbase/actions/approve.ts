import { Page } from 'playwright-core';

import { performPopupAction } from './util';

export const approve = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page) => {
    await popup.getByTestId('allow-authorize-button').click();
  });
};
