import { Page, Request } from 'playwright-core';
import { clickOnButton, performPopupAction } from '../../../helpers';
import { AddNetwork, UpdateNetworkRpc } from '../../../types';
import { closePopup } from '../setup/setupActions';
import {
  errorMessage,
  findNetworkListItem,
  goHome,
  networkListItem,
  openNetworkDropdown,
  openNetworkSettings,
  waitForSelectedNetwork,
} from './helpers';

export const switchNetwork =
  (page: Page) =>
  async (network = 'main'): Promise<void> => {
    await page.bringToFront();
    await openNetworkDropdown(page);

    const item = await findNetworkListItem(page, network);
    await item.click();

    // MetaMask 13 keeps the network picker open after selecting a custom
    // network. Close it explicitly so the wallet returns to its home view
    // before the caller continues with the connection/signing flow.
    const closeButton = page.getByTestId('modal-header-close-button');
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await closeButton.waitFor({ state: 'hidden' }).catch(() => undefined);
    }

    await waitForSelectedNetwork(page, network);
  };

export const addNetwork =
  (page: Page) =>
  async ({ networkName, rpc, chainId, symbol }: AddNetwork): Promise<void> => {
    await openNetworkSettings(page);
    await page.getByTestId('networks-page-add-custom-network-button').click();

    await page.getByTestId('network-form-network-name').fill(networkName);
    await page.getByTestId('test-add-rpc-drop-down').click();
    await clickOnButton(page, 'Add RPC URL');
    const rpcChecked = waitForRpcCheck(page, rpc);
    await page.getByTestId('rpc-url-input-test').fill(rpc);
    await clickOnButton(page, 'Add URL');
    await page.getByTestId('network-form-chain-id').fill(String(chainId));
    await page.getByTestId('network-form-ticker-input').fill(symbol);

    // A clashing chain id is reported straight away, but a mismatch with the RPC only once it has
    // answered, so give the form a moment to render that answer before looking for an error
    await rpcChecked;
    const error = errorMessage(page);
    const hasError = await error
      .waitFor({ timeout: 500 })
      .then(() => true)
      .catch(() => false);
    if (hasError) {
      const message = await error.innerText();
      await goHome(page);
      throw new SyntaxError(message);
    }

    await clickOnButton(page, 'Save');
    // Saving returns to the networks list once the background has stored the network
    await networkListItem(page, networkName).waitFor();
    await goHome(page);

    // This popup is fairly random in terms of timing
    // and can show before switch to network click is gone
    await closePopup(page);

    await switchNetwork(page)(networkName);
  };

// The RPC page asks a new RPC for its chain id before letting it be added, and the network form asks
// again once it is, so the form's answer is the second request to the RPC
const waitForRpcCheck = (page: Page, rpc: string): Promise<void> => {
  const isRpcCheck = (request: Request): boolean => request.url().startsWith(rpc);
  const checks: Request[] = [];
  const onRequest = (request: Request): void => {
    if (isRpcCheck(request)) checks.push(request);
  };
  page.on('request', onRequest);

  const formCheck = (async (): Promise<Request | undefined> => {
    while (checks.length < 2) {
      const request = await page.waitForEvent('request', { predicate: isRpcCheck, timeout: 10_000 }).catch(() => null);
      if (!request) break;
    }
    page.off('request', onRequest);
    return checks[1];
  })();

  return formCheck
    .then(async (request) => {
      const response = await request?.response();
      await response?.finished();
    })
    .catch(() => undefined);
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

    // The confirmation closes before the background has removed the network, so wait for its row to go
    await networkListItem(page, name).waitFor({ state: 'hidden' });
    await goHome(page);
  };

export const hasNetwork =
  (page: Page) =>
  async (name: string): Promise<boolean> => {
    await page.bringToFront();
    await openNetworkSettings(page);

    const found = await networkListItem(page, name).isVisible();
    await goHome(page);

    return found;
  };

export const confirmNetworkSwitch = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await popup.getByTestId('page-container-footer-next').click();
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
    // Saving returns to the networks list once the background has stored the change
    await page.getByTestId('networks-page-list').waitFor();
    await goHome(page);
  };
