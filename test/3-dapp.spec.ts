import { CoinbaseWallet } from '../src';
import { forCoinbase } from './helpers/itForWallet';
import { testWithWallet as test } from './helpers/testWithWallet';

test.describe('when interacting with dapps', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForSelector('#ready');
  });

  test('should be able to connect', async ({ wallet, page }) => {
    await page.click('.connect-button');
    await wallet.approve();

    await page.waitForSelector('#connected');
  });

  test('should be able to switch networks', async ({ wallet, page }) => {
    await forCoinbase(wallet, async () => {
      await page.click('.switch-network-button');

      await page.waitForSelector('#switchNetwork');
    });
  });

  test('should be able to sign messages', async ({ wallet, page }) => {
    await page.click('.sign-button');
    await wallet.sign();

    await page.waitForSelector('#signed');
  });

  test.describe('when confirming a transaction', () => {
    test('should be able to confirm without altering gas settings', async ({ wallet, page }) => {
      await page.click('.connect-button');
      await page.waitForSelector('#connected');

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
