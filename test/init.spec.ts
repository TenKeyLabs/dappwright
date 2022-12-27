import { BrowserContext, Page } from 'playwright-core';
import { Dappwright } from '../src';
import launchBrowser from './helpers/launchBrowser';

describe('when the test environment is initialized', () => {
  let browserContext: BrowserContext, wallet: Dappwright, testPage: Page;

  beforeAll(async () => {
    [browserContext, testPage, wallet] = await launchBrowser();
  });

  afterAll(async () => {
    await browserContext.close();
  });

  it('should be running, playwright', () => {
    expect(browserContext).toBeTruthy();
  });

  it('should open, test page', async () => {
    expect(testPage).toBeTruthy();
    expect(await testPage.title()).toEqual('Local wallet test');
  });

  it('should open the wallet', () => {
    expect(wallet.page).toBeTruthy();
  });
});
