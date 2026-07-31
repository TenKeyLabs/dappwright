import { test as base, TestInfo } from '@playwright/test';
import { BrowserContext } from 'playwright-core';
import { bootstrap, Dappwright, getWallet, OfficialOptions } from '../../src';

type ProjectMetadata = OfficialOptions & { account?: string };

/**
 * Point the wallet at the account its project owns.
 *
 * Both projects import the same seed, so without this they drive the same address on the shared
 * chain. The project runs on a single worker, which means every spec file shares one wallet -
 * so a spec that switches accounts leaves the next one somewhere unexpected. Any file that
 * transacts should call this to put the wallet back on its own account.
 */
export const useProjectAccount = async (wallet: Dappwright, info: TestInfo): Promise<void> => {
  const { account } = info.project.metadata as ProjectMetadata;
  if (account) await wallet.switchAccount(account);
};

export const testWithWallet = base.extend<{ wallet: Dappwright }, { walletContext: BrowserContext }>({
  walletContext: [
    async ({}, use, info) => {
      const { account: _account, ...projectMetadata } = info.project.metadata as ProjectMetadata;
      const [wallet, __, browserContext] = await bootstrap('', {
        ...projectMetadata,
        headless: info.project.use.headless,
      });

      await useProjectAccount(wallet, info);

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
