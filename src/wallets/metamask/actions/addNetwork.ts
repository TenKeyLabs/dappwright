import { Page } from 'playwright-core';
import { clickOnButton } from '../../../helpers';
import { AddNetwork } from '../../../types';

import { clickOnLogo, getErrorMessage, openNetworkDropdown } from './helpers';

export const addNetwork =
  (page: Page) =>
  async ({ networkName, rpc, chainId, symbol }: AddNetwork): Promise<void> => {
    await page.bringToFront();
    await openNetworkDropdown(page);
    await clickOnButton(page, 'Add network');

    await page.getByTestId('network-display').click();
    await page.getByRole('button', { name: 'Add network' }).click();
    await page.getByTestId('add-network-manually').click();
    await page.getByLabel('Network name').fill(networkName);
    await page.getByLabel('New RPC URL').fill(rpc);
    await page.getByLabel('Chain ID').fill(String(chainId));
    await page.getByTestId('network-form-ticker-input').fill(symbol);

    const errorMessage = await getErrorMessage(page);
    if (errorMessage) {
      await clickOnLogo(page);
      throw new SyntaxError(errorMessage);
    }

    await clickOnButton(page, 'Save');

    const switchNetworkClick = (): Promise<void> =>
      page.locator('button', { hasText: `Switch to ${networkName}` }).click();

    // This popup is fairly random in terms of timing
    // and can show before switch to network click is gone
    const gotItClick = (): Promise<void> =>
      page.waitForTimeout(2000).then(() =>
        page
          .locator('button', { hasText: 'Got it' })
          .isVisible()
          .then((gotItButtonVisible) => {
            if (gotItButtonVisible) return clickOnButton(page, 'Got it');
            return Promise.resolve();
          }),
      );

    await Promise.all([switchNetworkClick(), gotItClick()]);
  };
