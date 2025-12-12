import { Page } from 'playwright-core';

export const goHome = async (page: Page): Promise<void> => {
  await page.getByTestId('portfolio-navigation-link').click();
};
