import { Page } from 'playwright-core';
import { clickOnButton, waitForChromeState } from '../../../helpers';
import { openNetworkSettings } from './helpers';
import { networkListItem } from './util';

export const deleteNetwork =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.bringToFront();

    await openNetworkSettings(page);
    await networkListItem(page, name)
      .getByTestId(/network-list-item-options-button/)
      .click();

    await page.getByTestId('network-list-item-options-delete').click();
    await clickOnButton(page, 'Delete');

    await waitForChromeState(page);
  };
