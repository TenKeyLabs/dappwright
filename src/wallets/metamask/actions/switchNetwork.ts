import { Page } from 'playwright-core';
import { waitForChromeState } from '../../../helpers';
import { openNetworkDropdown } from './helpers';
import { networkListItem } from './util';

export const switchNetwork =
  (page: Page) =>
  async (network = 'main'): Promise<void> => {
    await page.bringToFront();
    await openNetworkDropdown(page);

    await networkListItem(page, network).click();

    await waitForChromeState(page);
  };
