import { Page } from 'playwright-core';
import { waitForChromeState } from '../../../helpers';
import { openNetworkDropdown } from './helpers';

export const switchNetwork =
  (page: Page) =>
  async (network = 'main'): Promise<void> => {
    await page.bringToFront();
    await openNetworkDropdown(page);

    const networkListItem = page.locator('.multichain-network-list-item').filter({ has: page.getByTestId(network) });
    await networkListItem.click();

    await waitForChromeState(page);
  };
