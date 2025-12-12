import { Page } from 'playwright-core';

import { goHome } from './helpers';

export const deleteNetwork =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.getByTestId('settings-navigation-link').click();
    await page.getByTestId('network-setting-cell-pressable').click();

    // Search for network then click on the first result
    await page.getByTestId('network-list-search').fill(name);
    await (await page.waitForSelector('//div[@data-testid="list-"][1]//button')).click();

    await page.getByTestId('custom-network-delete').click();
    await goHome(page);
  };
