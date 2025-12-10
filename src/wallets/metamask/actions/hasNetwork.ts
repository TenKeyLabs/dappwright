import { Page } from 'playwright-core';
import { openNetworkSettings } from './helpers';
import { networkListItem } from './util';

export const hasNetwork =
  (page: Page) =>
  async (name: string): Promise<boolean> => {
    await page.bringToFront();
    await openNetworkSettings(page);

    const hasNetwork = await networkListItem(page, name).isVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click();

    return hasNetwork;
  };
