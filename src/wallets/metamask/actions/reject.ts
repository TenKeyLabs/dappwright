import { Page } from 'playwright-core';
import { performSidepanelAction } from './util';

export const reject = (page: Page) => async (): Promise<void> => {
  await performSidepanelAction(page, async (popup) => {
    const cancelButton = popup.getByTestId('confirm-footer-cancel-button');
    const rejectButton = popup.getByTestId('cancel-btn');

    await cancelButton.or(rejectButton).click();
  });
};
