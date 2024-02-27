import { Page } from 'playwright-core';
import { clickOnButton, waitForChromeState } from '../../../helpers';
import { openNetworkDropdown } from './helpers';

export const deleteNetwork =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.bringToFront();

    await openNetworkDropdown(page);

    await page.locator('.multichain-network-list-menu').getByText(name, { exact: true }).hover();

    await clickOnButton(page, 'Delete network?');
    await clickOnButton(page, 'Delete');
    await waitForChromeState(page);
  };
