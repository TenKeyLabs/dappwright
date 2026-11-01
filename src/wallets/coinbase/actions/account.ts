import { Page } from 'playwright-core';

export const countAccounts = (page: Page) => async (): Promise<number> => {
  await page.getByTestId('wallet-switcher--dropdown').click();
  const accounts = page.locator('//*[@data-testid="wallet-switcher--dropdown"]/*/*[2]/*');
  await accounts.first().waitFor();
  const count = await accounts.count();
  await page.getByTestId('wallet-switcher--dropdown').click();
  return count;
};

export const createAccount =
  (page: Page) =>
  async (name?: string): Promise<void> => {
    if (name) {
      // eslint-disable-next-line no-console
      console.warn('parameter "name" is not supported for Coinbase');
    }

    await page.getByTestId('portfolio-header--switcher-cell-pressable').click();
    await page.getByTestId('wallet-switcher--manage').click();
    await page.getByTestId('manage-wallets-account-item--action-cell-pressable').click();

    // The wallet returns to the portfolio once the account exists, and shows its real header after
    // loading it, unless the help prompt that appears once is in the way
    const helpPrompt = page.getByTestId('add-new-wallet--continue');
    const portfolioHeader = page.getByTestId('portfolio-header--switcher-cell-pressable');
    await helpPrompt.or(portfolioHeader).first().waitFor();
    if (await helpPrompt.isVisible()) {
      await helpPrompt.click();
      await portfolioHeader.waitFor();
    }
  };

export const switchAccount =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.getByTestId('portfolio-header--switcher-cell-pressable').click();

    const nameRegex = new RegExp(`${name} \\$`);
    await page.getByRole('button', { name: nameRegex }).click();
  };

export const deleteAccount = async (_: string): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('deleteAccount not implemented - Coinbase does not support importing/removing additional private keys');
};

export const importPK = async (_: string): Promise<void> => {
  // eslint-disable-next-line no-console
  console.warn('importPK not implemented - Coinbase does not support importing/removing private keys');
};
