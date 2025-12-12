import { Page } from 'playwright-core';

import { waitForChromeState } from '../../../helpers';
import { AddNetwork } from '../../../types';
import { goHome } from './helpers';

export const addNetwork =
  (page: Page) =>
  async (options: AddNetwork): Promise<void> => {
    await page.getByTestId('settings-navigation-link').click();
    await page.getByTestId('network-setting-cell-pressable').click();
    await page.getByTestId('add-custom-network').click();
    await page.getByTestId('custom-network-name-input').fill(options.networkName);
    await page.getByTestId('custom-network-rpc-url-input').fill(options.rpc);
    await page.getByTestId('custom-network-chain-id-input').fill(options.chainId.toString());
    await page.getByTestId('custom-network-currency-symbol-input').fill(options.symbol);
    await page.getByTestId('custom-network-save').click();

    // Check for error messages
    let errorNode;
    try {
      errorNode = await page.waitForSelector('//span[@data-testid="text-input-error-label"]', {
        timeout: 50,
      });
    } catch {
      // No errors found
    }

    if (errorNode) {
      const errorMessage = await errorNode.textContent();
      throw new SyntaxError(errorMessage);
    }

    await waitForChromeState(page);
    await goHome(page);
  };
