import { test as base } from '@playwright/test';
import { BrowserContext } from 'playwright-core';
import { bootstrap, Dappwright, getWallet, OfficialOptions } from '../../src';

export const testWithWallet = base.extend<{ wallet: Dappwright }, { walletContext: BrowserContext }>({
  walletContext: [
    async ({}, use, info) => {
      const projectMetadata = info.project.metadata as OfficialOptions;
      const [_, __, browserContext] = await bootstrap('', {
        ...projectMetadata,
        headless: info.project.use.headless,
      });

      await use(browserContext);
      await browserContext.close();
    },
    { scope: 'worker' },
  ],
  context: async ({ walletContext }, use) => {
    await use(walletContext);
  },
  wallet: async ({ walletContext }, use, info) => {
    const projectMetadata = info.project.metadata;
    const wallet = await getWallet(projectMetadata.wallet, walletContext);
    await use(wallet);
  },
});
