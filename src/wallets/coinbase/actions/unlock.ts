import { Page } from 'playwright-core';

import { goHome } from './helpers';

export const unlock =
  (page: Page) =>
  async (password = 'password1234!!!!'): Promise<void> => {
    // last() because it seems to be a rendering issue of some sort
    await page.getByTestId('unlock-with-password').last().fill(password);
    await page.getByTestId('unlock-wallet-button').last().click();

    // Go back home since wallet returns to last visited page when unlocked.
    await goHome(page);

    // Wait for homescreen data to load
    await page.waitForSelector("//div[@data-testid='asset-list']//*[not(text='')]", { timeout: 10000 });
  };
