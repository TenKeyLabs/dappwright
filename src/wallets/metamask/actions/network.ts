import { Page, Request } from 'playwright-core';
import { clickOnButton, performPopupAction } from '../../../helpers';
import { AddNetwork, UpdateNetworkRpc } from '../../../types';
import {
  networkFormError,
  readError,
  findNetworkListItem,
  goHome,
  networkListItem,
  openNetworkDropdown,
  openNetworkSettings,
  waitForSelectedNetwork,
} from './helpers';

const RPC_ANSWER_TIMEOUT = 30_000;
const isRequestTo =
  (rpc: string) =>
  (request: Request): boolean =>
    request.url().startsWith(rpc);

// The network form's name and chain id fields suggest Chainlist networks in a dropdown that covers the
// rest of the form until it is dismissed
const fillDismissingChainlist = async (page: Page, testId: string, value: string): Promise<void> => {
  const input = page.getByTestId(testId);
  await input.fill(value);
  await input.press('Escape');
  await page.getByTestId('networks-page-chainlist-dropdown').waitFor({ state: 'hidden' });
};

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

    await fillDismissingChainlist(page, 'network-form-network-name', networkName);
    await page.getByTestId('test-add-rpc-drop-down').click();
    await clickOnButton(page, 'Add RPC URL');
    const rpcChecked = waitForRpcCheck(page, rpc);
    const rpcFailed = page.waitForEvent('requestfailed', { predicate: isRequestTo(rpc), timeout: RPC_ANSWER_TIMEOUT });
    await page.getByTestId('rpc-url-input-test').fill(rpc);

    // MetaMask gives no message for an RPC it can't reach, it just never enables the button
    const addUrl = page.getByRole('button', { name: 'Add URL', exact: true, disabled: false });
    const rpcAnswered = await Promise.race([
      addUrl.waitFor({ timeout: RPC_ANSWER_TIMEOUT }).then(
        () => true,
        () => false,
      ),
      rpcFailed.then(
        () => false,
        () => false,
      ),
    ]);
    if (!rpcAnswered) {
      await goHome(page);
      throw new SyntaxError(`MetaMask could not get an answer from the RPC URL ${rpc}`);
    }

    await addUrl.click();
    await fillDismissingChainlist(page, 'network-form-chain-id', String(chainId));
    await page.getByTestId('network-form-ticker-input').fill(symbol);

    // A clashing chain id is reported straight away, but a mismatch with the RPC only once it has answered
    const answeredChainId = await rpcChecked;
    const error = networkFormError(page);
    await error
      .or(page.getByRole('button', { name: 'Save', exact: true, disabled: false }))
      .first()
      .waitFor();
    const formError = await readError(error);
    if (formError) {
      await goHome(page);
      throw new SyntaxError(formError);
    }

    // Save stays enabled while the form waits for the RPC, and saving then stores the network despite
    // the mismatch. The form's error can lag behind the answer, so go by the answer itself.
    if (answeredChainId !== undefined && answeredChainId !== Number(chainId)) {
      await goHome(page);
      throw new SyntaxError(`The RPC URL you have entered returned a different chain ID (${answeredChainId}).`);
    }

    await clickOnButton(page, 'Save');
    // Saving returns to the networks list once the background has stored the network. The form can
    // flash an error on its way out, so anything it reports from here on doesn't count.
    await networkListItem(page, networkName).waitFor();
    await goHome(page);

    await switchNetwork(page)(networkName);
  };

// The RPC page asks a new RPC for its chain id before letting it be added, and the network form asks
// again once it is, so the form's answer is the second request to the RPC. Resolves to the chain id it
// answered with, or undefined if there was no readable answer.
const waitForRpcCheck = (page: Page, rpc: string): Promise<number | undefined> => {
  const isRpcCheck = isRequestTo(rpc);
  const checks: Request[] = [];
  const onRequest = (request: Request): void => {
    if (isRpcCheck(request)) checks.push(request);
  };
  page.on('request', onRequest);

  const formCheck = (async (): Promise<Request | undefined> => {
    while (checks.length < 2) {
      const request = await page
        .waitForEvent('request', { predicate: isRpcCheck, timeout: RPC_ANSWER_TIMEOUT })
        .catch(() => null);
      if (!request) break;
    }
    page.off('request', onRequest);
    return checks[1] ?? checks[0];
  })();

  return formCheck
    .then(async (request) => {
      const response = await request?.response();
      const answer = (await response?.json()) as { result?: string } | undefined;
      return answer?.result ? Number(answer.result) : undefined;
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

    await fillDismissingChainlist(page, 'network-form-chain-id', String(chainId));
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
