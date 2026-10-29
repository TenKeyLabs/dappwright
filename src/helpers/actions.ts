import { Page } from 'playwright-core';
import { Step, WalletOptions } from '../wallets/wallets';

export const clickOnButton = async (page: Page, text: string): Promise<void> => {
  await page.getByRole('button', { name: text, exact: true }).click();
};

export const performPopupAction = async (page: Page, action: (popup: Page) => Promise<void>): Promise<void> => {
  const popup = await page.context().waitForEvent('page'); // Wait for the popup to show up

  await action(popup);
  if (!popup.isClosed()) await popup.waitForEvent('close');
};

export const performSetup =
  (page: Page, defaultSteps: Step<WalletOptions>[]) =>
  async <Options = WalletOptions>(options?: Options, steps: Step<Options>[] = defaultSteps): Promise<void> => {
    for (const step of steps) {
      await step(page, options);
    }
  };
