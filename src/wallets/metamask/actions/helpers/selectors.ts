import { ElementHandle, Locator, Page } from 'playwright-core';

export const getSettingsSwitch = (page: Page, text: string): Promise<ElementHandle | null> =>
  page.waitForSelector([`//span[contains(.,'${text}')]/parent::div/following-sibling::div/label/div`].join('|'));

export const getErrorMessage = async (page: Page): Promise<string | undefined> => {
  try {
    const errorElement = await page.waitForSelector(`.mm-help-text.mm-box--color-error-default`, { timeout: 5000 });
    return await errorElement.innerText();
  } catch (_) {
    return undefined;
  }
};

export const accountList = (page: Page): Locator => {
  return page.locator('.multichain-account-cell');
};

export const accountListItem = (page: Page, name: string): Locator => {
  return accountList(page).filter({ has: page.getByText(name, { exact: true }) });
};

const networkMenuItemRegex = /^network-list-item-(?!options)\w+:\S+$/;
const networkList = (page: Page): Locator => {
  return page.getByTestId(networkMenuItemRegex);
};

export const networkListItem = (page: Page, name: string): Locator => {
  return networkList(page).filter({ has: page.getByText(name, { exact: true }) });
};

export const findNetworkListItem = async (page: Page, name: string): Promise<Locator> => {
  // MetaMask renders custom networks in a separate tab and has changed the
  // row test IDs between releases. Select by the visible, exact network name
  // instead of relying on the internal test-id format used by popular chains.
  const networkNames = page.getByText(name, { exact: true });

  for (const tabName of ['Popular', 'Custom']) {
    const tab = page.getByRole('tab', { name: tabName, exact: true });
    if ((await tab.getAttribute('aria-selected')) !== 'true') {
      await tab.click();
    }

    const count = await networkNames.count();
    for (let index = 0; index < count; index++) {
      const networkName = networkNames.nth(index);
      if (await networkName.isVisible().catch(() => false)) {
        return networkName;
      }
    }
  }

  throw new Error(`MetaMask network "${name}" was not found in the Popular or Custom network tabs`);
};
