import { Page } from 'playwright-core';
import { clickOnButton } from '../../../helpers';
import { AddNetwork } from '../../../types';

import { getErrorMessage, openNetworkDropdown } from './helpers';
import { switchNetwork } from './switchNetwork';

export const addNetwork =
  (page: Page) =>
  async ({ networkName, rpc, chainId, symbol }: AddNetwork): Promise<void> => {
    await openNetworkDropdown(page);
    await clickOnButton(page, 'Add a custom network');

    await page.getByTestId('network-form-network-name').fill(networkName);
    await page.getByTestId('test-add-rpc-drop-down').click();
    await clickOnButton(page, 'Add RPC URL');
    await page.getByTestId('rpc-url-input-test').fill(rpc);
    await clickOnButton(page, 'Add URL');
    await page.getByTestId('network-form-chain-id').fill(String(chainId));
    await page.getByTestId('network-form-ticker-input').fill(symbol);

    const errorMessage = await getErrorMessage(page);
    if (errorMessage) {
      await page.locator("button[aria-label='Close']").click();
      throw new SyntaxError(errorMessage);
    }

    await clickOnButton(page, 'Save');

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

    await Promise.all([switchNetwork(page)(networkName), gotItClick()]);
  };
