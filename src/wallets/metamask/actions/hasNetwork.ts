import { Page } from 'playwright-core';
import { openNetworkDropdown } from './helpers';

export const hasNetwork =
  (page: Page) =>
  async (name: string): Promise<boolean> => {
    await page.bringToFront();
    await openNetworkDropdown(page);
    const isNetworkListed = await page.isVisible(
      `//div[@class="network-dropdown-list"]/li[contains(string(), "${name}")]`,
    );
    (await page.waitForSelector('.network-display')).click();
    return isNetworkListed;
  };
