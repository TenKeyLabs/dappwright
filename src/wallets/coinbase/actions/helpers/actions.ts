import { Page } from 'playwright-core';

export const goHome = async (page: Page): Promise<void> => {
  await page.getByTestId('portfolio-navigation-link').click();
};

export const navigateHome = async (page: Page): Promise<void> => {
  // Reloading interrupts the wallet while it adds the accounts it found for an imported seed, so
  // only navigate when there is a query to drop
  if (!page.url().includes('?')) return;
  await page.goto(page.url().split('?')[0]);
};
