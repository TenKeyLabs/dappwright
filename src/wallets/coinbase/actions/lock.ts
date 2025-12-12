import { Page } from 'playwright-core';

export const lock = (page: Page) => async (): Promise<void> => {
  await page.getByTestId('settings-navigation-link').click();
  await page.getByTestId('lock-wallet-button').click();
};
