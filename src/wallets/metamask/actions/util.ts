import { Locator, Page } from 'playwright-core';

export const accountSyncTimeout = 120000;

export const performPopupAction = async (page: Page, action: (popup: Page) => Promise<void>): Promise<void> => {
  const popup = await page.context().waitForEvent('page'); // Wait for the popup to show up

  await action(popup);
  if (!popup.isClosed()) await popup.waitForEvent('close');
};

export const accountList = (page: Page): Locator => {
  return page.locator('.multichain-account-cell');
};

export const accountListItem = (page: Page, name: string): Locator => {
  return accountList(page).filter({ has: page.getByText(name, { exact: true }) });
};

const networkMenuItemRegex = /network-list-item-eip\d+:\d+$/;
const networkList = (page: Page): Locator => {
  return page.getByTestId(networkMenuItemRegex);
};

export const networkListItem = (page: Page, name: string): Locator => {
  return networkList(page).filter({ has: page.getByText(name, { exact: true }) });
};

export const clickBackButton = async (page: Page): Promise<void> => {
  return page.getByRole('button', { name: 'Back' }).click();
};
