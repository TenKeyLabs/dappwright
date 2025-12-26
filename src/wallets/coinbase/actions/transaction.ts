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
    try {
      // Help prompt appears once
      await (await popup.waitForSelector("text='Got it'", { timeout: 1000 })).click();
    } catch {
      // Ignore missing help prompt
    }

    await popup.getByTestId('request-confirm-button').click();
  });
};
