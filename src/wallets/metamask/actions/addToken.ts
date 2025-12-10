import { Page } from 'playwright-core';
import { AddToken } from '../../../types';

export const addToken =
  (page: Page) =>
  async ({ tokenAddress, symbol }: AddToken): Promise<void> => {
    await page.bringToFront();

    await page.getByTestId('asset-list-control-bar-action-button').click();
    await page.getByTestId('importTokens__button').click();
    // await page.getByTestId('import-tokens-modal-custom-token-tab').click();
    await page.getByTestId('import-tokens-modal-custom-address').fill(tokenAddress);

    await page.waitForTimeout(500);

    if (symbol) {
      await page.getByTestId('import-tokens-modal-custom-symbol').fill(symbol);
    }

    await page.getByTestId('import-tokens-button-next').click();
    await page.getByTestId('import-tokens-modal-import-button').click();
  };
