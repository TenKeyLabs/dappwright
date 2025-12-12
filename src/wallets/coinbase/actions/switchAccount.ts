import { Page } from 'playwright-core';

export const switchAccount =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.getByTestId('portfolio-header--switcher-cell-pressable').click();

    const nameRegex = new RegExp(`${name} \\$`);
    await page.getByRole('button', { name: nameRegex }).click();
  };
