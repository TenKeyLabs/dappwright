import { ElementHandle, Page } from 'playwright-core';

export const getSettingsSwitch = (page: Page, text: string): Promise<ElementHandle | null> =>
  page.waitForSelector([`//span[contains(.,'${text}')]/parent::div/following-sibling::div/label/div`].join('|'));

export const getErrorMessage = async (page: Page): Promise<string | false> => {
  const options: Parameters<Page['waitForSelector']>[1] = { timeout: 1000 };

  const errorElement = await Promise.race([
    page.waitForSelector(`.mm-help-text.mm-box--color-error-default`, options),
  ]).catch(() => null);
  if (!errorElement) return false;
  return (errorElement as HTMLElement).innerText;
};

export const getAccountMenuButton = (page: Page): Promise<ElementHandle | null> =>
  page.waitForSelector(`button.menu-bar__account-options`);
