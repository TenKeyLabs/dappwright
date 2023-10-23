import { Page } from 'playwright-core';

export const getTokenBalance =
  (page: Page) =>
  async (_: string): Promise<number> => {
    await page.bringToFront();
    await page.waitForTimeout(1000);

    const balanceText = await page.getByTestId('eth-overview__primary-currency').textContent();

    return parseFloat(balanceText);
  };
