import { ElementHandle, Page } from 'playwright-core';

export const getSettingsSwitch = (page: Page, text: string): Promise<ElementHandle | null> =>
  page.waitForSelector([`//span[contains(.,'${text}')]/parent::div/following-sibling::div/label/div`].join('|'));

export const getErrorMessage = async (page: Page): Promise<string | undefined> => {
  try {
    const errorElement = await page.waitForSelector(`.mm-help-text.mm-box--color-error-default`, { timeout: 1000 });
    return await errorElement.innerText();
  } catch (_) {
    return undefined;
  }
};
