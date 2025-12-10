import { Locator, Page } from 'playwright-core';
import { waitForChromeState } from '../../helpers';
import { AddNetwork, AddToken, UpdateNetworkRpc } from '../../types';
import { performPopupAction } from '../metamask/actions';
import { WalletOptions } from '../wallets';

const goHome = async (page: Page): Promise<void> => {
  await page.getByTestId('portfolio-navigation-link').click();
};

export const navigateHome = async (page: Page): Promise<void> => {
  await page.goto(page.url().split('?')[0]);
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
  await page.getByRole('button', { name: 'Acknowledge' }).click();
  await page.getByTestId('secret-input').fill(seed);
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

export const reject = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page) => {
    const denyButton = popup.getByTestId('deny-authorize-button');
    const cancelButton = popup.getByTestId('request-cancel-button');

    await denyButton.or(cancelButton).click();
  });
};

export const sign = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup: Page) => {
    await popup.getByTestId('sign-message').click();
  });
};

export const signin = async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('signin not implemented');
};

export const lock = (page: Page) => async (): Promise<void> => {
  await page.getByTestId('settings-navigation-link').click();
  await page.getByTestId('lock-wallet-button').click();
};

export const unlock =
  (page: Page) =>
  async (password = 'password1234!!!!'): Promise<void> => {
    // last() because it seems to be a rendering issue of some sort
    await page.getByTestId('unlock-with-password').last().fill(password);
    await page.getByTestId('unlock-wallet-button').last().click();

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

export const getTokenBalance =
  (page: Page) =>
  async (tokenSymbol: string): Promise<number> => {
    const tokenValueRegex = new RegExp(String.raw` ${tokenSymbol}`);

    const readFromCryptoTab = async (): Promise<Locator | undefined> => {
      await page.bringToFront();
      await page.getByTestId('portfolio-selector-nav-tabLabel--crypto').click();
      const tokenItem = page.getByTestId(/asset-item.*cell-pressable/).filter({
        hasText: tokenValueRegex,
      });

      await page.waitForTimeout(500);

      return (await tokenItem.isVisible()) ? tokenItem : null;
    };

    const readFromTestnetTab = async (): Promise<Locator | undefined> => {
      await page.getByTestId('portfolio-selector-nav-tabLabel--testnet').click();

      const tokenItem = page.getByTestId(/asset-item.*cell-pressable/).filter({
        hasText: tokenValueRegex,
      });

      await page.waitForTimeout(500);

      return (await tokenItem.isVisible()) ? tokenItem : null;
    };

    const readAttempts = [readFromCryptoTab, readFromTestnetTab];

    let button: Locator | undefined;
    for (const readAttempt of readAttempts) {
      button = await readAttempt();
    }

    if (!button) throw new Error(`Token ${tokenSymbol} not found`);

    const text = await button.textContent();
    const currencyAmount = text.replaceAll(/ |,/g, '').split(tokenSymbol)[2];

    return currencyAmount ? Number(currencyAmount) : 0;
  };

export const countAccounts = (page: Page) => async (): Promise<number> => {
  await page.getByTestId('wallet-switcher--dropdown').click();
  const count = await page.locator('//*[@data-testid="wallet-switcher--dropdown"]/*/*[2]/*').count();
  await page.getByTestId('wallet-switcher--dropdown').click();
  return count;
};

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

export const switchAccount =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.getByTestId('portfolio-header--switcher-cell-pressable').click();

    const nameRegex = new RegExp(`${name} \\$`);
    await page.getByRole('button', { name: nameRegex }).click();
  };

//
// Unimplemented actions
//

export const deleteAccount = async (_: string): Promise<void> => {
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

export const updateNetworkRpc = async (_: UpdateNetworkRpc): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('updateNetworkRpc not implemented - Coinbase uses different network management');
};
