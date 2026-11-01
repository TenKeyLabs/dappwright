import { Page } from 'playwright-core';
import { AddNetwork, UpdateNetworkRpc } from '../../../types';
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

    // Saving returns to the network list once the network is stored, and a rejected network stays on the form
    const error = page.getByTestId('text-input-error-label');
    const networkList = page.getByTestId('network-list-search');
    await error.or(networkList).first().waitFor();
    // An error can be gone by the time it's read, which would otherwise wait for it to come back forever
    const message = (await error.first().isVisible())
      ? await error
          .first()
          .textContent({ timeout: 5000 })
          .catch(() => undefined)
      : undefined;
    if (message) throw new SyntaxError(message);

    await goHome(page);
  };

export const deleteNetwork =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.getByTestId('settings-navigation-link').click();
    await page.getByTestId('network-setting-cell-pressable').click();

    // Search for network then click on the first result
    await page.getByTestId('network-list-search').fill(name);
    await (await page.waitForSelector('//div[@data-testid="list-"][1]//button')).click();

    await page.getByTestId('custom-network-delete').click();
    await goHome(page);
  };

export const hasNetwork =
  (page: Page) =>
  async (name: string): Promise<boolean> => {
    await page.getByTestId('settings-navigation-link').click();
    await page.getByTestId('network-setting').click();
    await page.getByTestId('network-list-search').fill(name);
    const networkIsListed = await page.isVisible('//div[@data-testid="list-"][1]//button');
    await goHome(page);
    return networkIsListed;
  };

export const switchNetwork = async (_: string): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('switchNetwork not implemented');
};

// TODO: Cannot implement until verified coinbase wallet bug is fixed.
export const confirmNetworkSwitch = async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('confirmNetworkSwitch not implemented');
};

export const updateNetworkRpc = async (_: UpdateNetworkRpc): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('updateNetworkRpc not implemented - Coinbase uses different network management');
};
