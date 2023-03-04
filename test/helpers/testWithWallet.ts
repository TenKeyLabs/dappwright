import test from '@playwright/test';
import { BrowserContext } from 'playwright-core';
import { Dappwright, getWallet, launch, MetaMaskWallet } from '../../src';

let sharedBrowserContext: BrowserContext;

export const testWithWallet = test.extend<{
  context: BrowserContext;
  wallet: Dappwright;
}>({
  context: async ({ context: _ }, use, info) => {
    const projectMetadata = info.project.metadata;

    if (!sharedBrowserContext) {
      const { browserContext, wallet } = await launch('', {
        wallet: projectMetadata.wallet,
        version: projectMetadata.version,
        headless: info.project.use.headless,
      });

      await wallet.unlock(projectMetadata.password);

      // Swap network chain IDs to match 31337
      if (wallet instanceof MetaMaskWallet) {
        await wallet.switchNetwork('Ethereum Mainnet');
        await wallet.deleteNetwork('Localhost 8545');
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
