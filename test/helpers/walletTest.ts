import test from '@playwright/test';
import { BrowserContext } from 'playwright-core';
import { bootstrap, Dappwright, getWallet, MetaMaskWallet, OfficialOptions } from '../../src';

let sharedBrowserContext: BrowserContext;

export const testWithWallet = test.extend<{
  context: BrowserContext;
  wallet: Dappwright;
}>({
  context: async ({ context: _ }, use, info) => {
    if (!sharedBrowserContext) {
      const projectMetadata = info.project.metadata as OfficialOptions;
      const [wallet, _, browserContext] = await bootstrap('', {
        ...projectMetadata,
        headless: info.project.use.headless,
      });

      // Swap network chain IDs to match 31337
      if (wallet instanceof MetaMaskWallet) {
        await wallet.addNetwork({
          networkName: 'Localhost 8545',
          rpc: 'http://localhost:8545',
          chainId: 31337,
          symbol: 'ETH',
        });
      }

      sharedBrowserContext = browserContext;
    }

    await use(sharedBrowserContext);
  },
  wallet: async ({ context }, use, info) => {
    const projectMetadata = info.project.metadata;
    const wallet = await getWallet(projectMetadata.wallet, context);
    await use(wallet);
  },
});
