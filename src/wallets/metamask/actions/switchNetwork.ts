import { Page } from 'playwright-core';
import { waitForChromeState } from '../../../helpers';
import { openNetworkDropdown } from './helpers';

export const switchNetwork =
  (page: Page) =>
  async (network = 'main'): Promise<void> => {
    await page.bringToFront();
    await openNetworkDropdown(page);

    await page.locator('.multichain-network-list-menu').getByRole('button', { name: network, exact: true }).click();

    await waitForChromeState(page);
  };
