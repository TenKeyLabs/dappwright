import { Page } from 'playwright-core';

export const performPopupAction = async (page: Page, action: (popup: Page) => Promise<void>): Promise<void> => {
  const popup = await page.context().waitForEvent('page'); // Wait for the popup to show up

  await action(popup);
  if (!popup.isClosed()) await popup.waitForEvent('close');
};
