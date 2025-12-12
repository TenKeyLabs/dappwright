import { Locator, Page } from 'playwright-core';

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

      await page.waitForTimeout(500);

      return (await tokenItem.isVisible()) ? tokenItem : null;
    };

    const readFromTestnetTab = async (): Promise<Locator | undefined> => {
      await page.getByTestId('portfolio-selector-nav-tabLabel--testnet').click();

      const tokenItem = page.getByTestId(/asset-item.*cell-pressable/).filter({
        hasText: tokenValueRegex,
      });

      await page.waitForTimeout(500);

      return (await tokenItem.isVisible()) ? tokenItem : null;
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
