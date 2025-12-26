import { Page } from 'playwright-core';
import { Step, WalletOptions } from '../wallets/wallets';
import { getElementByContent, getInputByLabel } from './selectors';

export const waitForChromeState = async (page: Page): Promise<void> => {
  await page.waitForTimeout(3000);
};

export const clickOnElement = async (page: Page, text: string, type?: string): Promise<void> => {
  const element = await getElementByContent(page, text, type);
  await element.click();
};

export const clickOnButton = async (page: Page, text: string): Promise<void> => {
  await page.getByRole('button', { name: text, exact: true }).click();
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

export const performPopupAction = async (page: Page, action: (popup: Page) => Promise<void>): Promise<void> => {
  const popup = await page.context().waitForEvent('page'); // Wait for the popup to show up

  await action(popup);
  if (!popup.isClosed()) await popup.waitForEvent('close');
};

export const performSidepanelAction = async (page: Page, action: (sidepanel: Page) => Promise<void>): Promise<void> => {
  const sidepanel = page
    .context()
    .pages()
    .find((p) => p.url().includes('sidepanel.html'));

  if (!sidepanel) {
    const pageUrls = page
      .context()
      .pages()
      .flatMap((p) => p.url());
    throw new Error('Sidepanel page not found. Current pages:\n' + pageUrls.join('\n- '));
  }

  await action(sidepanel);
};

export const performSetup =
  (page: Page, defaultSteps: Step<WalletOptions>[]) =>
  async <Options = WalletOptions>(options?: Options, steps: Step<Options>[] = defaultSteps): Promise<void> => {
    for (const step of steps) {
      await step(page, options);
    }
  };
