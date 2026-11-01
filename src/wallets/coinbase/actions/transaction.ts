import { Page } from 'playwright-core';
import { performPopupAction } from '../../../helpers';

export const approve = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page) => {
    await popup.getByTestId('allow-authorize-button').click();
  });
};

export const reject = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page) => {
    const denyButton = popup.getByTestId('deny-authorize-button');
    const cancelButton = popup.getByTestId('request-cancel-button');

    await denyButton.or(cancelButton).click();
  });
};

export const sign = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page) => {
    await popup.getByTestId('sign-message').click();
  });
};

export const confirmTransaction = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page): Promise<void> => {
    // Help prompt appears once, whenever it gets in the way of confirming
    await popup.addLocatorHandler(popup.getByText('Got it', { exact: true }), (gotIt) => gotIt.click());

    await popup.getByTestId('request-confirm-button').click();
  });
};
