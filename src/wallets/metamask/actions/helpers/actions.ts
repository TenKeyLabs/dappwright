import { Page } from 'playwright-core';
import { accountList } from './selectors';

export async function goToSettings(metamaskPage: Page): Promise<void> {
  await openAccountOptionsMenu(metamaskPage);
  await metamaskPage.getByTestId('global-menu-settings').click();
}

export const setSettingsSwitch = async (page: Page, testId: string, enabled: boolean): Promise<void> => {
  // The test id sits on a visually hidden checkbox that never sets `checked`, but its value
  // attribute mirrors the background state, so it only flips once MetaMask has applied the change
  const checkbox = page.getByTestId(testId);
  if ((await checkbox.getAttribute('value')) !== String(enabled)) {
    await checkbox.locator('xpath=..').click();
  }

  await checkbox.and(page.locator(`[value="${enabled}"]`)).waitFor({ state: 'attached' });
};

// The network filter is disabled while a switch is pending and then shows the selected network
export const waitForSelectedNetwork = async (page: Page, name: string): Promise<void> => {
  await page.getByTestId('sort-by-networks').and(page.locator(':enabled')).filter({ hasText: name }).waitFor();
};

// The account picker in the header shows the selected account once the background has switched
export const waitForSelectedAccount = async (page: Page, name: string): Promise<void> => {
  await page.getByTestId('account-menu-icon').filter({ hasText: name }).waitFor();
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
