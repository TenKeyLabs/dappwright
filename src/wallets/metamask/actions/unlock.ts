import { Page } from 'playwright-core';
import { closePopup, closeSolanaPopup } from '../setup/setupActions';

export const unlock =
  (page: Page) =>
  async (password = 'password1234'): Promise<void> => {
    await page.bringToFront();

    await page.getByTestId('unlock-password').fill(password);
    await page.getByTestId('unlock-submit').click();

    await closePopup(page);
    await closeSolanaPopup(page);
  };
