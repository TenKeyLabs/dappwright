import { Page } from 'playwright-core';

import { performPopupAction } from './util';

export const reject = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    const cancelButton = popup.getByTestId('confirmation-cancel-button');
    const rejectButton = popup.getByTestId('page-container-footer-cancel');

    await cancelButton.or(rejectButton).click();
  });
};
