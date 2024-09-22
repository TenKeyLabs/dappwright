import { CoinbaseWallet } from '../src';
import { forCoinbase, forMetaMask } from './helpers/itForWallet';
import { testWithWallet as test } from './helpers/walletTest';

test.describe('when interacting with dapps', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForSelector('#ready');
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

  test.only('should sign SIWE complient message', async ({ wallet, page }) => {
    await forMetaMask(wallet, async () => {
      await page.click('.sign-siwe-message');
      await wallet.signin();

      await page.waitForSelector('#siwe-signed');
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
    await page.click('.switch-network-button');

    await forMetaMask(wallet, async () => {
      await wallet.switchNetwork('Sepolia');
      await page.bringToFront();
      await page.reload();
      await wallet.page.reload();

      await page.click('.switch-network-button');
      await wallet.confirmNetworkSwitch();
    });

    await page.waitForSelector('#switchNetwork');
  });

  test('should be able to sign messages', async ({ wallet, page }) => {
    await page.click('.sign-button');
    await wallet.sign();

    await page.waitForSelector('#signed');
  });

  test.describe('when confirming a transaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.reload();
      await page.click('.connect-button');
      await page.waitForSelector('#connected');
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
