import { Page } from 'playwright-core';
import { clickOnButton } from '../../../helpers';
import { AddToken } from '../../../types';
import { clickOnLogo } from './helpers';

export const addToken =
  (page: Page) =>
  async ({ tokenAddress, symbol, decimals = 0 }: AddToken): Promise<void> => {
    await page.bringToFront();

    await page.getByTestId('import-token-button').click();
    await page.getByTestId('importTokens__button').click();
    await clickOnButton(page, 'Custom token');
    await page.getByTestId('import-tokens-modal-custom-address').fill(tokenAddress);

    await page.waitForTimeout(500);

    if (symbol) {
      await page.getByTestId('import-tokens-modal-custom-symbol').fill(symbol);
    }

    if (decimals) {
      await page.getByTestId('import-tokens-modal-custom-decimals').fill(decimals.toString());
    }

    await clickOnButton(page, 'Next');
    await page.getByTestId('import-tokens-modal-import-button').click();
    await clickOnLogo(page);
  };
