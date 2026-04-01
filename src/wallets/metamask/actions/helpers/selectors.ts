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
  const item = networkListItem(page, name);
  if (await item.isVisible()) return item;

  const popularTab = page.getByRole('tab', { name: 'Popular' });
  const isPopularSelected = (await popularTab.getAttribute('aria-selected')) === 'true';
  await page.getByRole('tab', { name: isPopularSelected ? 'Custom' : 'Popular' }).click();

  return item;
};
