import { Page } from 'playwright-core';

import { performPopupAction } from './util';

export const reject = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page) => {
    const denyButton = popup.getByTestId('deny-authorize-button');
    const cancelButton = popup.getByTestId('request-cancel-button');

    await denyButton.or(cancelButton).click();
  });
};
