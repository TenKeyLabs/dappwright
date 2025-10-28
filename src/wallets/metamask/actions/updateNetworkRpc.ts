import type { Page } from 'playwright-core';
import { clickOnButton } from '../../../helpers';
import type { UpdateNetworkRpc } from '../../../types';

import { openNetworkDropdown } from './helpers';

export const updateNetworkRpc =
  (page: Page) =>
  async ({ chainId, rpc }: UpdateNetworkRpc): Promise<void> => {
    await page.bringToFront();
    await openNetworkDropdown(page);
    await clickOnButton(page, 'Add a custom network');

    await page.getByTestId('network-form-chain-id').fill(String(chainId));
    await clickOnButton(page, 'edit the original network');

    await page.getByTestId('test-add-rpc-drop-down').click();
    await clickOnButton(page, 'Add RPC URL');
    await page.getByTestId('rpc-url-input-test').fill(rpc);
    await clickOnButton(page, 'Add URL');

    await clickOnButton(page, 'Save');
  };
