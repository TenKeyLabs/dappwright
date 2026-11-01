import { Locator, Page } from 'playwright-core';
import { AddToken } from '../../../types';

// A missing token leaves nothing to wait for, so this only limits how long it takes to report one
const isListed = (tokenItem: Locator): Promise<boolean> =>
  tokenItem
    .waitFor({ timeout: 5000 })
    .then(() => true)
    .catch(() => false);

export const getTokenBalance =
  (page: Page) =>
  async (tokenSymbol: string): Promise<number> => {
    const tokenValueRegex = new RegExp(String.raw` ${tokenSymbol}`);

    const readFromCryptoTab = async (): Promise<Locator | undefined> => {
      await page.bringToFront();
      await page.getByTestId('portfolio-selector-nav-tabLabel--crypto').click();
      const tokenItem = page.getByTestId(/asset-item.*cell-pressable/).filter({
        hasText: tokenValueRegex,
      });

      return (await tokenItem.isVisible()) ? tokenItem : null;
    };

    const readFromTestnetTab = async (): Promise<Locator | undefined> => {
      await page.getByTestId('portfolio-selector-nav-tabLabel--testnet').click();

      const tokenItem = page.getByTestId(/asset-item.*cell-pressable/).filter({
        hasText: tokenValueRegex,
      });

      return (await isListed(tokenItem)) ? tokenItem : null;
    };

    const readAttempts = [readFromCryptoTab, readFromTestnetTab];

    let button: Locator | undefined;
    for (const readAttempt of readAttempts) {
      button = await readAttempt();
    }

    if (!button) throw new Error(`Token ${tokenSymbol} not found`);

    const text = await button.textContent();
    const currencyAmount = text.replaceAll(/ |,/g, '').split(tokenSymbol)[2];

    return currencyAmount ? Number(currencyAmount) : 0;
  };

export const addToken = async (_: AddToken): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('addToken not implemented - Coinbase does not support adding custom tokens');
};
