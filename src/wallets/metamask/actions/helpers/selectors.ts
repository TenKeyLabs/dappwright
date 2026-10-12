import { Locator, Page } from 'playwright-core';

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

// The network picker groups its rows into default, custom, test and additional networks
const networkPickerItemRegex = /^home-network-filter-(network|custom|test|additional)-/;

export const findNetworkListItem = async (page: Page, name: string): Promise<Locator> => {
  const networkPicker = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: 'Select network', exact: true }) });
  await networkPicker.waitFor({ state: 'visible' });

  const item = networkPicker
    .getByTestId(networkPickerItemRegex)
    .filter({ has: page.getByText(name, { exact: true }) })
    .first();
  try {
    await item.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    throw new Error(`MetaMask network "${name}" was not found in the network picker`);
  }

  return item;
};
