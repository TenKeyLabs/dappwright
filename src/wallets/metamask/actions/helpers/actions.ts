import { Page } from 'playwright-core';
import { accountList } from './selectors';

export async function goToSettings(metamaskPage: Page): Promise<void> {
  await openAccountOptionsMenu(metamaskPage);
  await metamaskPage.getByTestId('global-menu-settings').click();
}

export const clickOnSettingsSwitch = async (page: Page, testId: string): Promise<void> => {
  // The test id sits on a visually hidden checkbox
  await page.getByTestId(testId).locator('xpath=..').click();
};

export const openNetworkDropdown = async (page: Page): Promise<void> => {
  const networkDropdown = page.getByTestId('sort-by-networks');
  await networkDropdown.waitFor({ state: 'visible' });
  await networkDropdown.click();
};

export const openNetworkSettings = async (page: Page): Promise<void> => {
  await openAccountOptionsMenu(page);
  await page.getByTestId('global-menu-networks').click();
  await page.getByTestId('networks-page-list').waitFor();
};

export const goHome = async (page: Page): Promise<void> => {
  await page.goto(page.url().split('#')[0]);
};

export const openAccountOptionsMenu = async (page: Page): Promise<void> => {
  if (page.url().includes('drawerOpen=true')) {
    await page.getByTestId('global-menu-settings').waitFor();
    return;
  }

  const accountOptionsMenuButton = page.getByTestId('account-options-menu-button');
  const accountOptionsNotificationButton = page.getByTestId('notifications-tag-counter__unread-dot');

  await accountOptionsMenuButton.or(accountOptionsNotificationButton).first().click();
};

export const openAccountMenu = async (page: Page): Promise<void> => {
  await page.getByTestId('account-menu-icon').click();
  await accountList(page).first().waitFor();
};

export const clickBackButton = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Back' }).click();
};
