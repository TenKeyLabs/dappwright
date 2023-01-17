import { BrowserContext, Page } from 'playwright-core';
import { Dappwright, OfficialOptions } from '../src/index';
import { CoinbaseWallet } from '../src/wallets/coinbase/coinbase';
import { MetaMaskWallet } from '../src/wallets/metamask/metamask';
import { forCoinbase, forMetaMask } from './helpers/itForWallet';
import launchBrowser from './helpers/launchBrowser';

describe.each<OfficialOptions>([
  {
    wallet: 'coinbase',
    version: CoinbaseWallet.recommendedVersion,
  },
  {
    wallet: 'metamask',
    version: MetaMaskWallet.recommendedVersion,
  },
])('$wallet - when interacting with dapps', (options: OfficialOptions) => {
  let browserContext: BrowserContext, wallet: Dappwright, testPage: Page;

  beforeAll(async () => {
    [browserContext, testPage, wallet] = await launchBrowser(options);

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

    await testPage.bringToFront();
  });

  afterAll(async () => {
    await browserContext.close();
  });

  it('should be able to connect', async () => {
    await testPage.click('.connect-button');
    await wallet.approve();

    await testPage.waitForSelector('#connected');
  });

  it('should be able to switch networks', async () => {
    await forCoinbase(wallet, async () => {
      await testPage.click('.switch-network-button');

      await testPage.waitForSelector('#switchNetwork');
    });
  });

  it('should be able to sign messages', async () => {
    await testPage.click('.sign-button');
    await wallet.sign();

    await testPage.waitForSelector('#signed');
  });

  describe('when confirming a transaction', () => {
    it('should be able to confirm without altering gas settings', async () => {
      await forMetaMask(wallet, async () => {
        await testPage.click('.increase-button');
        await wallet.confirmTransaction();

        await testPage.waitForSelector('#increased');
      });
    });

    it('should be able to confirm with custom gas settings', async () => {
      await forMetaMask(wallet, async () => {
        await testPage.click('.transfer-button');

        await wallet.confirmTransaction({
          gas: 21000,
          priority: 2,
          gasLimit: 202020,
        });

        await testPage.waitForSelector('#transferred');
      });
    });
  });
});
