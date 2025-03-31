import { Page } from 'playwright-core';
import { getSettingsSwitch } from './selectors';

export const clickOnSettingsSwitch = async (page: Page, text: string): Promise<void> => {
  const button = await getSettingsSwitch(page, text);
  await button.click();
};

export const openNetworkDropdown = async (page: Page): Promise<void> => {
  const networkDropdown = page.getByTestId('network-display');
  await networkDropdown.waitFor({ state: 'visible' });
  await networkDropdown.click();
};

export const openAccountOptionsMenu = async (page: Page): Promise<void> => {
  const accountOptionsMenuButton = page.getByTestId('account-options-menu-button');
  await accountOptionsMenuButton.scrollIntoViewIfNeeded();
  await accountOptionsMenuButton.click();
};

export const openAccountMenu = async (page: Page): Promise<void> => {
  await page.getByTestId('account-menu-icon').click();
};

export const clickOnLogo = async (page: Page): Promise<void> => {
  const header = await page.waitForSelector('.app-header__logo-container');
  await header.click();
};
