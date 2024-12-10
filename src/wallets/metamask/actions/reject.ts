import { Page } from 'playwright-core';

import { performPopupAction } from './util';

export const reject = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    const cancelButton = popup.getByTestId('confirm-footer-cancel-button');
    const rejectButton = popup.getByTestId('cancel-btn');

    await cancelButton.or(rejectButton).click();
  });
};
