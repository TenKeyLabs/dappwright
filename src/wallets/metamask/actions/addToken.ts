import { Page } from 'playwright-core';
import {
  clickOnButton,
  clickOnElement,
  getInputByLabel,
  getInputByLabelSelector,
  typeOnInputField,
} from '../../../helpers';
import { AddToken } from '../../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addToken =
  (page: Page, version?: string) =>
  async ({ tokenAddress, symbol, decimals = 0 }: AddToken): Promise<void> => {
    await page.bringToFront();

    await clickOnElement(page, 'Import tokens');
    await page.waitForTimeout(500);
    await clickOnButton(page, 'Custom token');
    await typeOnInputField(page, 'Token contract address', tokenAddress);

    // TODO: handle case when contract is not containing symbol
    const symbolInput = await getInputByLabelSelector('Token symbol');

    if (symbol) {
      await typeOnInputField(page, 'Token symbol', symbol, true);
    }

    const decimalsInput = await getInputByLabel(page, 'Token decimal');
    if (!(await decimalsInput.isDisabled())) await decimalsInput.type(String(decimals));

    await clickOnButton(page, 'Add custom token');
    await clickOnButton(page, 'Import tokens');
  };
