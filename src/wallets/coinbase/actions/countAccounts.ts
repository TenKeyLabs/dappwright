import { Page } from 'playwright-core';

export const countAccounts = (page: Page) => async (): Promise<number> => {
  await page.getByTestId('wallet-switcher--dropdown').click();
  const count = await page.locator('//*[@data-testid="wallet-switcher--dropdown"]/*/*[2]/*').count();
  await page.getByTestId('wallet-switcher--dropdown').click();
  return count;
};
