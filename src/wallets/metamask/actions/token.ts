import { Page } from 'playwright-core';
import { AddToken } from '../../../types';

export const addToken =
  (page: Page) =>
  async ({ tokenAddress, symbol }: AddToken): Promise<void> => {
    await page.bringToFront();

    await page.getByTestId('asset-list-control-bar-action-button').click();
    await page.getByTestId('importTokens__button').click();
    await page.getByTestId('import-tokens-modal-custom-address').fill(tokenAddress);

    await page.waitForTimeout(500);

    if (symbol) {
      await page.getByTestId('import-tokens-modal-custom-symbol').fill(symbol);
    }

    await page.getByTestId('import-tokens-button-next').click();
    await page.getByTestId('import-tokens-modal-import-button').click();
  };

export const getTokenBalance =
  (page: Page) =>
  async (tokenSymbol: string): Promise<number> => {
    await page.bringToFront();
    await page.waitForTimeout(1000);

    const tokenValueRegex = new RegExp(String.raw`\d ${tokenSymbol}$`);
    const valueElement = page.getByTestId('multichain-token-list-item-value').filter({ hasText: tokenValueRegex });

    if (!(await valueElement.isVisible())) {
      throw new Error(`Token ${tokenSymbol} not found`);
    }

    const valueText = await valueElement.textContent();
    const balance = valueText.split(' ')[0].replace(/,/, '');

    return parseFloat(balance);
  };
