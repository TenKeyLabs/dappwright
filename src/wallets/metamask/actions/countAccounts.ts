import { Page } from 'playwright-core';

export const countAccounts = (_: Page) => async (): Promise<number> => {
  // eslint-disable-next-line no-console
  console.warn('countAccounts not yet implemented');
  return -1;
};
