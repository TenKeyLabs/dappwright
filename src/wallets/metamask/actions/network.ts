import { Page } from 'playwright-core';
import { clickOnButton, clickOnElement, performSidepanelAction, waitForChromeState } from '../../../helpers';
import { AddNetwork, UpdateNetworkRpc } from '../../../types';
import { closePopup } from '../setup/setupActions';
import { getErrorMessage, networkListItem, openNetworkDropdown, openNetworkSettings } from './helpers';

export const switchNetwork =
  (page: Page) =>
  async (network = 'main'): Promise<void> => {
    await page.bringToFront();
    await openNetworkDropdown(page);

    await networkListItem(page, network).click();

    await waitForChromeState(page);
  };

export const addNetwork =
  (page: Page) =>
  async ({ networkName, rpc, chainId, symbol }: AddNetwork): Promise<void> => {
    await openNetworkDropdown(page);
    await clickOnElement(page, 'Custom');
    await clickOnButton(page, 'Add custom network');

    await page.getByTestId('network-form-network-name').fill(networkName);
    await page.getByTestId('test-add-rpc-drop-down').click();
    await clickOnButton(page, 'Add RPC URL');
    await page.getByTestId('rpc-url-input-test').fill(rpc);
    await clickOnButton(page, 'Add URL');
    await page.getByTestId('network-form-chain-id').fill(String(chainId));
    await page.getByTestId('network-form-ticker-input').fill(symbol);

    const errorMessage = await getErrorMessage(page);
    if (errorMessage) {
      await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
      throw new SyntaxError(errorMessage);
    }

    await clickOnButton(page, 'Save');
    await page.getByTestId('modal-header-close-button').click();

    // This popup is fairly random in terms of timing
    // and can show before switch to network click is gone
    await closePopup(page);

    await waitForChromeState(page);
    await switchNetwork(page)(networkName);
  };

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

export const hasNetwork =
  (page: Page) =>
  async (name: string): Promise<boolean> => {
    await page.bringToFront();
    await openNetworkSettings(page);

    const hasNetwork = await networkListItem(page, name).isVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click();

    return hasNetwork;
  };

export const confirmNetworkSwitch = (page: Page) => async (): Promise<void> => {
  await performSidepanelAction(page, async (sidepanel) => {
    await sidepanel.getByTestId('page-container-footer-next').click();
    await waitForChromeState(page);
  });
};

export const updateNetworkRpc =
  (page: Page) =>
  async ({ chainId, rpc }: UpdateNetworkRpc): Promise<void> => {
    await page.bringToFront();
    await openNetworkSettings(page);

    await clickOnButton(page, 'Add a custom network');

    await page.getByTestId('network-form-chain-id').fill(String(chainId));
    await clickOnButton(page, 'edit the original network');

    await page.getByTestId('test-add-rpc-drop-down').click();
    await clickOnButton(page, 'Add RPC URL');
    await page.getByTestId('rpc-url-input-test').fill(rpc);
    await clickOnButton(page, 'Add URL');

    await clickOnButton(page, 'Save');
  };
