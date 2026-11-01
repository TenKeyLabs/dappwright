import { Page } from 'playwright-core';
import { EXTENSION_ID } from '../downloader/constants';
import { Step, WalletOptions } from '../wallets/wallets';

export const clickOnButton = async (page: Page, text: string): Promise<void> => {
  await page.getByRole('button', { name: text, exact: true }).click();
};

const POPUP_TIMEOUT = 120_000;

// Each wallet's homePath. They're spelled out here because the wallets import these helpers.
export const WALLET_HOME_PATHS = ['/home.html', '/index.html'];

// An approval popup is an extension page that carries either its own path (MetaMask's notification.html) or
// the request in a query string (Coinbase serves its popups from index.html). This doesn't go by the wallet
// page's url, because the page bootstrap returns is free to be navigated somewhere else, like a dapp.
const isPopup = (walletPage: Page, candidate: Page): boolean => {
  if (candidate === walletPage || candidate.isClosed()) return false;
  try {
    const url = new URL(candidate.url());
    return url.host === EXTENSION_ID && (!WALLET_HOME_PATHS.includes(url.pathname) || !!url.search);
  } catch {
    return false;
  }
};

// The action that opens a popup has already finished by the time this is called, so the popup can be open
// by now. Listening for a new page would miss it and wait forever, so look for it among the open pages.
const waitForPopup = async (page: Page): Promise<Page> => {
  const deadline = Date.now() + POPUP_TIMEOUT;
  while (Date.now() < deadline) {
    if (page.isClosed()) throw new Error('The wallet page closed while waiting for a popup');

    // Any other extension page opened before this one, so the newest is the one being asked for
    const popup = page
      .context()
      .pages()
      .filter((candidate) => isPopup(page, candidate))
      .pop();
    if (popup) return popup;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`No wallet popup opened within ${POPUP_TIMEOUT / 1000}s`);
};

export const performPopupAction = async (page: Page, action: (popup: Page) => Promise<void>): Promise<void> => {
  const popup = await waitForPopup(page);

  await action(popup);
  if (!popup.isClosed()) await popup.waitForEvent('close');
};

export const performSetup =
  (page: Page, defaultSteps: Step<WalletOptions>[]) =>
  async <Options = WalletOptions>(options?: Options, steps: Step<Options>[] = defaultSteps): Promise<void> => {
    for (const step of steps) {
      await step(page, options);
    }
  };
