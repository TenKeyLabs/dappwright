import { Page } from 'playwright-core';

import { performPopupAction } from './util';

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
