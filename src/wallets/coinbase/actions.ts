import { ElementHandle, Page } from 'playwright-core';
import { AddNetwork, AddToken } from '../..';
import { waitForChromeState } from '../../helpers';
import { performPopupAction } from '../metamask/actions';
import { WalletOptions } from '../wallets';
import { extensionUrl } from './coinbase';

const goHome = async (page: Page): Promise<void> => {
  await page.getByTestId('portfolio-navigation-link').click();
};

export async function getStarted(
  page: Page,
  {
    seed = 'already turtle birth enroll since owner keep patch skirt drift any dinner',
    password = 'password1234!!!!',
  }: WalletOptions,
): Promise<void> {
  // Welcome screen
  await page.getByTestId('btn-import-existing-wallet').click();

  // Import Wallet
  await page.getByTestId('btn-import-recovery-phrase').click();
  await page.getByTestId('seed-phrase-input').fill(seed);
  await page.getByTestId('btn-import-wallet').click();
  await page.getByTestId('setPassword').fill(password);
  await page.getByTestId('setPasswordVerify').fill(password);
  await page.getByTestId('terms-and-privacy-policy').check();
  await page.getByTestId('btn-password-continue').click();

  // Allow extension state/settings to settle
  await waitForChromeState(page);
}

export const approve = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page) => {
    await popup.getByTestId('allow-authorize-button').click();
  });
};

export const sign = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page) => {
    await popup.getByTestId('sign-message').click();
  });
};

export const lock = (page: Page) => async (): Promise<void> => {
  await page.getByTestId('settings-navigation-link').click();
  await page.getByTestId('lock-wallet-button').click();
};

export const unlock =
  (page: Page) =>
  async (password = 'password1234!!!!'): Promise<void> => {
    await page.getByTestId('unlock-with-password').fill(password);
    await page.getByTestId('unlock-wallet-button').click();

    // Go back home since wallet returns to last visited page when unlocked.
    await goHome(page);

    // Wait for homescreen data to load
    await page.waitForSelector("//div[@data-testid='asset-list']//*[not(text='')]", { timeout: 10000 });
  };

export const confirmTransaction = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page): Promise<void> => {
    try {
      // Help prompt appears once
      await (await popup.waitForSelector("text='Got it'", { timeout: 1000 })).click();
    } catch {
      // Ignore missing help prompt
    }

    await popup.getByTestId('request-confirm-button').click();
  });
};

export const addNetwork =
  (page: Page) =>
  async (options: AddNetwork): Promise<void> => {
    // Add network flow closes current screen and opens another, direct access is cleaner for now
    const settingsPage = await page.context().newPage();
    await settingsPage.goto(`${extensionUrl}?internalPopUpRequest=true&action=addCustomNetwork`);
    await settingsPage.getByTestId('custom-network-name-input').fill(options.networkName);
    await settingsPage.getByTestId('custom-network-rpc-url-input').fill(options.rpc);
    await settingsPage.getByTestId('custom-network-chain-id-input').fill(options.chainId.toString());
    await settingsPage.getByTestId('custom-network-currency-symbol-input').fill(options.symbol);
    await settingsPage.getByTestId('custom-network-save').click();

    // Check for error messages
    let errorNode;
    try {
      errorNode = await settingsPage.waitForSelector('//span[@data-testid="text-input-error-label"]', {
        timeout: 50,
      });
    } catch {
      // No errors found
    }

    if (errorNode) {
      const errorMessage = await errorNode.textContent();
      await settingsPage.close();
      throw new SyntaxError(errorMessage);
    }

    await settingsPage.waitForEvent('close');

    // New network isn't reflected until page is reloaded
    await page.bringToFront();
    await page.reload();
  };

export const deleteNetwork =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.getByTestId('settings-navigation-link').click();
    await page.getByTestId('settings-networks-menu-cell-pressable').click();

    // Search for network then click on the first result
    await page.getByTestId('network-list-search').fill(name);
    (await page.waitForSelector('//div[@data-testid="list-"][1]//button')).click();

    await page.getByTestId('custom-network-delete').click();
    await goHome(page);
  };

export const hasNetwork =
  (page: Page) =>
  async (name: string): Promise<boolean> => {
    await page.getByTestId('settings-navigation-link').click();
    await page.getByTestId('settings-networks-menu-cell-pressable').click();
    await page.getByTestId('network-list-search').fill(name);
    const networkIsListed = await page.isVisible('//div[@data-testid="list-"][1]//button');
    await goHome(page);
    return networkIsListed;
  };

export const getTokenBalance =
  (page: Page) =>
  async (tokenSymbol: string): Promise<number> => {
    const readFromCryptoTab = async (): Promise<ElementHandle<SVGElement | HTMLElement>> => {
      await page.bringToFront();
      await page.getByTestId('portfolio-selector-nav-tabLabel--crypto').click();
      return await page.waitForSelector(
        '//button[contains(@data-testid, "asset-item")][contains(@data-testid, "ETH")]',
        {
          timeout: 500,
        },
      );
    };

    const readFromTestnetTab = async (): Promise<ElementHandle<SVGElement | HTMLElement>> => {
      await page.getByTestId('portfolio-selector-nav-tabLabel--testnet').click();
      return await page.waitForSelector(
        '//button[contains(@data-testid, "asset-item")][contains(@data-testid, "ETH")]',
        {
          timeout: 500,
        },
      );
    };

    const readAttempts = [readFromCryptoTab, readFromTestnetTab];

    let button: ElementHandle<SVGElement | HTMLElement>;
    for (const readAttempt of readAttempts) {
      try {
        button = await readAttempt();
      } catch {
        // Failed to read token value
      }
    }

    if (!button) return 0;

    const text = await button.textContent();
    const regexp = new RegExp(`(\\d.*) ${tokenSymbol}`, 'i');
    const matches = text.match(regexp);

    return matches && matches.length >= 2 ? Number(matches[1]) : 0;
  };

export const createAccount = (page: Page) => async (): Promise<void> => {
  await page.getByTestId('portfolio-header--switcher-cell-pressable').click();
  await page.getByTestId('wallet-switcher--action').click();
  await page.getByTestId('manage-wallets-account-item--action-cell-pressable').click();

  // Help prompt appears once
  try {
    await page.getByTestId('add-new-wallet--continue').click();
  } catch {
    // Ignore missing help prompt
  }
};

export const switchAccount =
  (page: Page) =>
  async (i: number): Promise<void> => {
    await page.getByTestId('portfolio-header--switcher-cell-pressable').click();
    (
      await page.waitForSelector(`(//button[@data-testid="wallet-switcher--wallet-item-cell-pressable"])[${i}]`)
    ).click();
  };

//
// Unimplemented actions
//

export const deleteAccount = async (_i: number): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('deleteAccount not implemented - Coinbase does not support importing/removing additional private keys');
};

export const addToken = async (_: AddToken): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('addToken not implemented - Coinbase does not support adding custom tokens');
};

export const importPK = async (_: string): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('importPK not implemented - Coinbase does not support importing/removing private keys');
};

export const switchNetwork = async (_: string): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('switchNetwork not implemented');
};

// TODO: Cannot implement until verified coinbase wallet bug is fixed.
export const confirmNetworkSwitch = async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('confirmNetorkSwitch not implemented');
};
