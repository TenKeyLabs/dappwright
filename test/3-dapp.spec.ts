import { CoinbaseWallet, MetaMaskWallet } from '../src';
import { forCoinbase, forMetaMask } from './helpers/itForWallet';
import { testWithWallet as test } from './helpers/walletTest';

// Adding manually only needed for Metamask since Coinbase does this automatically
test.beforeAll(async ({ wallet }) => {
  if (wallet instanceof MetaMaskWallet) {
    try {
      await wallet.addNetwork({
        networkName: 'GoChain Testnet',
        rpc: 'http://localhost:8545',
        chainId: 31337,
        symbol: 'GO',
      });
    } catch (_) {
      // Gracefully fail when running serially (ie. ci)
    }
  }
});

test.describe('when interacting with dapps', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForSelector('#ready');
    await page.waitForTimeout(1000); // Coinbase wallet needs a bit more time to load
  });

  test('should be able to reject to connect', async ({ wallet, page }) => {
    await page.click('.connect-button');
    await wallet.reject();

    await page.waitForSelector('#connect-rejected');
  });

  test('should be able to connect', async ({ wallet, page }) => {
    await forCoinbase(wallet, async () => {
      await page.click('.connect-button');
      await wallet.approve();

      await page.waitForSelector('#connected');
    });
  });

  test('should be able to sign in', async ({ wallet, page }) => {
    await forMetaMask(wallet, async () => {
      await page.click('.signin-button');
      await wallet.signin();

      await page.waitForSelector('#signedIn');
    });
  });

  test('should sign SIWE complient message', async ({ wallet, page }) => {
    await forMetaMask(wallet, async () => {
      await page.click('.sign-siwe-message');
      await wallet.signin();

      await page.waitForSelector('#siweSigned');
    });
  });

  test('should be able to sign in again', async ({ wallet, page }) => {
    await forMetaMask(wallet, async () => {
      await page.click('.signin-button');
      await wallet.signin();

      await page.waitForSelector('#signedIn');
    });
  });

  test('should be able to switch networks', async ({ wallet, page }) => {
    await page.click('.switch-network-live-test-button');

    await forMetaMask(wallet, async () => {
      await wallet.confirmNetworkSwitch();
    });

    await page.waitForSelector('#switchNetwork');
    await page.click('.switch-network-local-test-button');
  });

  test('should be able to sign messages', async ({ wallet, page }) => {
    await page.click('.sign-button');
    await wallet.sign();

    await page.waitForSelector('#signed');
  });

  test.describe('when confirming a transaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('.connect-button');
      await page.waitForSelector('#connected');
      await page.click('.switch-network-local-test-button');
    });

    test('should be able to reject', async ({ wallet, page }) => {
      await page.click('.transfer-button');
      await wallet.reject();

      await page.waitForSelector('#transfer-rejected');
    });

    test('should be able to confirm without altering gas settings', async ({ wallet, page }) => {
      if (wallet instanceof CoinbaseWallet && process.env.CI) test.skip(); // this page doesn't load in github actions

      await page.click('.increase-button');
      await wallet.confirmTransaction();

      await page.waitForSelector('#increased');
    });

    test('should be able to confirm with custom gas settings', async ({ wallet, page }) => {
      if (wallet instanceof CoinbaseWallet) test.skip();

      await page.click('.transfer-button');

      await wallet.confirmTransaction({
        gas: 4,
        priority: 3,
        gasLimit: 202020,
      });

      await page.waitForSelector('#transferred');
    });
  });
});
