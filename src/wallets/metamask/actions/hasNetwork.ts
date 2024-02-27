import { Page } from 'playwright-core';
import { openNetworkDropdown } from './helpers';

export const hasNetwork =
  (page: Page) =>
  async (name: string): Promise<boolean> => {
    await page.bringToFront();
    await openNetworkDropdown(page);

    const hasNetwork = await page.locator('.multichain-network-list-menu').locator('p', { hasText: name }).isVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click();

    return hasNetwork;
  };
