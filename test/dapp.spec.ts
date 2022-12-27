import { BrowserContext, Page } from 'playwright-core';
import { Dappwright } from '../src/index';
import launchBrowser from './helpers/launchBrowser';

describe('when interacting with dapps', () => {
  let browserContext: BrowserContext, wallet: Dappwright, testPage: Page;

  beforeAll(async () => {
    [browserContext, testPage, wallet] = await launchBrowser();
    await wallet.switchNetwork('local');
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

  it('should be able to sign messages', async () => {
    await testPage.click('.sign-button');
    await wallet.sign();

    await testPage.waitForSelector('#signed');
  });

  describe('when confirming a transaction', () => {
    it('should be able to confirm without altering gas settings', async () => {
      await testPage.click('.increase-button');
      await wallet.confirmTransaction();

      // confirms transasction sent successfully
      await testPage.waitForSelector('#increased');
    });

    it('should be able to confirm with custom gas settings', async () => {
      await testPage.click('.transfer-button');

      await wallet.confirmTransaction({
        gas: 21000,
        priority: 2,
        gasLimit: 202020,
      });

      // confirms transasction sent successfully
      await testPage.waitForSelector('#transferred');
    });
  });
});
