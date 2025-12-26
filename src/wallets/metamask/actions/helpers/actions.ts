import { Page } from 'playwright-core';
import { getSettingsSwitch } from './selectors';

export async function goToSettings(metamaskPage: Page): Promise<void> {
  await openAccountOptionsMenu(metamaskPage);
  await metamaskPage.getByTestId('global-menu-settings').click();
}

export const clickOnSettingsSwitch = async (page: Page, text: string): Promise<void> => {
  const button = await getSettingsSwitch(page, text);
  await button.click();
};

export const openNetworkDropdown = async (page: Page): Promise<void> => {
  const networkDropdown = page.getByTestId('sort-by-networks');
  await networkDropdown.waitFor({ state: 'visible' });
  await networkDropdown.click();
};

export const openNetworkSettings = async (page: Page): Promise<void> => {
  await openAccountOptionsMenu(page);
  await page.getByTestId('global-menu-networks').click();
};

export const openAccountOptionsMenu = async (page: Page): Promise<void> => {
  const accountOptionsMenuButton = page.getByTestId('account-options-menu-button');
  const accountOptionsNotificationButton = page.getByTestId('notifications-tag-counter__unread-dot');

  await accountOptionsMenuButton.or(accountOptionsNotificationButton).first().click();
};

export const openAccountMenu = async (page: Page): Promise<void> => {
  await page.getByTestId('account-menu-icon').click();
};

export const clickBackButton = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Back' }).click();
};
