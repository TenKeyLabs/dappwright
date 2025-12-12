import { Page } from 'playwright-core';

import { waitForChromeState } from '../../../helpers';

export const createAccount =
  (page: Page) =>
  async (name?: string): Promise<void> => {
    if (name) {
      // eslint-disable-next-line no-console
      console.warn('parameter "name" is not supported for Coinbase');
    }

    await page.getByTestId('portfolio-header--switcher-cell-pressable').click();
    await page.getByTestId('wallet-switcher--manage').click();
    await page.getByTestId('manage-wallets-account-item--action-cell-pressable').click();

    // Help prompt appears once
    try {
      await page.getByTestId('add-new-wallet--continue').click({ timeout: 2000 });
    } catch {
      // Ignore missing help prompt
    }

    await waitForChromeState(page);
  };
