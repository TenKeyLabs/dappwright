import { Page } from 'playwright-core';
import { getElementByContent, getInputByLabel } from './selectors';

export const waitForChromeState = async (page: Page): Promise<void> => {
  await page.waitForTimeout(3000);
};

export const clickOnElement = async (page: Page, text: string, type?: string): Promise<void> => {
  const element = await getElementByContent(page, text, type);
  await element.click();
};

export const clickOnButton = async (page: Page, text: string): Promise<void> => {
  const button = await getElementByContent(page, text, 'button');
  await button.click();
};

/**
 *
 * @param page
 * @param label
 * @param text
 * @param clear
 * @param excludeSpan
 * @param optional
 * @returns true if found and updated, false otherwise
 */
export const typeOnInputField = async (
  page: Page,
  label: string,
  text: string,
  clear = false,
  excludeSpan = false,
  optional = false,
): Promise<boolean> => {
  let input;
  try {
    input = await getInputByLabel(page, label, excludeSpan, 5000);
  } catch (e) {
    if (optional) return false;
    throw e;
  }

  if (clear)
    await page.evaluate((node) => {
      node.value = '';
    }, input);
  await input.type(text);
  return true;
};
