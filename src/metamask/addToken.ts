import { Page } from 'playwright-core';

import { clickOnButton, clickOnElement, getInputByLabel, getInputByLabelSelector, typeOnInputField } from '../helpers';
import { AddToken } from '../index';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addToken = (page: Page, version?: string) => async ({
  tokenAddress,
  symbol,
  decimals = 0,
}: AddToken): Promise<void> => {
  await page.bringToFront();

  await clickOnElement(page, 'Import tokens');
  await typeOnInputField(page, 'Token Contract Address', tokenAddress);

  // wait to metamask pull token data
  // TODO: handle case when contract is not containing symbol
  const symbolInput = await getInputByLabelSelector('Token Symbol');
  await page.waitForFunction((selector) => !!(document.querySelector(selector) as HTMLInputElement).value, symbolInput);

  if (symbol) {
    await clickOnElement(page, 'Edit');
    await typeOnInputField(page, 'Token Symbol', symbol, true);
  }

  const decimalsSelector = await getInputByLabelSelector('Token Decimal');
  const isDisabled = await page.evaluate(
    (selector) => (document.querySelector(selector) as HTMLInputElement).disabled,
    decimalsSelector,
  );

  const decimalsInput = await getInputByLabel(page, 'Token Decimal');
  if (!isDisabled) await decimalsInput.type(String(decimals));

  await clickOnButton(page, 'Add Custom Token');
  await clickOnButton(page, 'Import Tokens');
};
