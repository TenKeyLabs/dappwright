import { Page } from 'playwright-core';

export const getTokenBalance =
  (page: Page) =>
  async (tokenSymbol: string): Promise<number> => {
    await page.bringToFront();
    await page.waitForTimeout(1000);

    const tokenValueRegex = new RegExp(String.raw` ${tokenSymbol} $`);
    const valueElement = page.getByTestId('multichain-token-list-item-value').filter({ hasText: tokenValueRegex });

    if (!(await valueElement.isVisible())) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    const valueText = await valueElement.textContent();
    const balance = valueText.split(' ')[0];

    return parseFloat(balance);
  };
