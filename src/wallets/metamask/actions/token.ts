import { Page } from 'playwright-core';
import { AddToken } from '../../../types';
import { goHome } from './helpers';

export const addToken =
  (page: Page) =>
  async ({ tokenAddress, symbol, decimals }: AddToken): Promise<void> => {
    await page.bringToFront();

    await page.getByTestId('asset-list-control-bar-action-button').click();
    await page.getByTestId('manageTokens__button').click();
    await page.getByTestId('token-management-add-custom-token-button').click();
    await page.getByRole('textbox', { name: 'Token contract address' }).fill(tokenAddress);

    // The symbol and decimal fields appear once the address is entered, prefilled when MetaMask
    // can read them from the contract
    const symbolInput = page.getByRole('textbox', { name: 'Token symbol' });
    const decimalsInput = page.getByRole('spinbutton', { name: 'Token decimal' });
    await symbolInput.waitFor();
    await page.waitForTimeout(500);

    if (symbol) {
      await symbolInput.fill(symbol);
    }
    if (decimals !== undefined) {
      await decimalsInput.fill(String(decimals));
    } else if (!(await decimalsInput.inputValue())) {
      await decimalsInput.fill('18');
    }

    await page.getByTestId('custom-token-import-submit-button').click();
    await page.getByTestId('token-management-custom-token-success-toast').waitFor();
    await goHome(page);
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
