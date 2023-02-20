import { Page } from 'playwright-core';
import { getAccountMenuButton, getSettingsSwitch } from './selectors';

export const clickOnSettingsSwitch = async (page: Page, text: string): Promise<void> => {
  const button = await getSettingsSwitch(page, text);
  await button.click();
};

export const openNetworkDropdown = async (page: Page): Promise<void> => {
  const networkSwitcher = await page.waitForSelector('.network-display');
  await networkSwitcher.click();
  await page.waitForSelector('li.dropdown-menu-item');
};

export const openProfileDropdown = async (page: Page): Promise<void> => {
  const accountSwitcher = await page.waitForSelector('.account-menu__icon');
  await accountSwitcher.click({ noWaitAfter: true, force: true });
};

export const openAccountDropdown = async (page: Page): Promise<void> => {
  const accMenu = await getAccountMenuButton(page);
  await accMenu.click();
  await page.waitForSelector('.menu__container.account-options-menu');
};

export const clickOnLogo = async (page: Page): Promise<void> => {
  const header = await page.waitForSelector('.app-header__logo-container');
  await header.click();
};
