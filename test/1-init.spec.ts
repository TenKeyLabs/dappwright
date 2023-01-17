import { BrowserContext, Page } from 'playwright-core';
import { Dappwright, OfficialOptions } from '../src';
import { CoinbaseWallet } from '../src/wallets/coinbase/coinbase';
import { MetaMaskWallet } from '../src/wallets/metamask/metamask';
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
])('$wallet - when the test environment is initialized', (options: OfficialOptions) => {
  let browserContext: BrowserContext, wallet: Dappwright, testPage: Page;

  beforeAll(async () => {
    [browserContext, testPage, wallet] = await launchBrowser(options);
  });

  afterAll(async () => {
    await browserContext.close();
  });

  it('should be running, playwright', async () => {
    expect(browserContext).toBeTruthy();
  });

  it('should open, test page', async () => {
    expect(testPage).toBeTruthy();
    expect(await testPage.title()).toEqual('Local wallet test');
  });

  it('should open the wallet', async () => {
    expect(wallet.page).toBeTruthy();
  });
});
