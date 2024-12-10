import { Page } from 'playwright-core';
import { clickOnButton, waitForChromeState } from '../../../helpers';
import { openNetworkDropdown } from './helpers';

export const deleteNetwork =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.bringToFront();

    await openNetworkDropdown(page);
    const networkListItem = page.locator('.multichain-network-list-item').filter({ has: page.getByTestId(name) });
    await networkListItem.hover();
    await networkListItem.getByTestId(/network-list-item-options-button.*/).click();

    await clickOnButton(page, 'Delete');
    await clickOnButton(page, 'Delete');
    await waitForChromeState(page);
  };
