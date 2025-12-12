import { Page } from 'playwright-core';

import { goHome } from './helpers';

export const hasNetwork =
  (page: Page) =>
  async (name: string): Promise<boolean> => {
    await page.getByTestId('settings-navigation-link').click();
    await page.getByTestId('network-setting').click();
    await page.getByTestId('network-list-search').fill(name);
    const networkIsListed = await page.isVisible('//div[@data-testid="list-"][1]//button');
    await goHome(page);
    return networkIsListed;
  };
