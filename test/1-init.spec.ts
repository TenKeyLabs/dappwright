import { expect } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { CoinbaseWallet, MetaMaskWallet, OfficialOptions } from '../src';
import { launchBrowser } from '../src/launch';
import { openWalletHome } from '../src/wallets/wallets';
import { testWithWallet as test } from './helpers/walletTest';

test.describe(`when the test environment is initialized`, () => {
  test('should open, test page', async ({ page }) => {
    expect(page).toBeTruthy();

    await page.goto('http://localhost:8080');
    expect(await page.title()).toEqual('Local wallet test');
  });

  test('should open the wallet', async ({ wallet }) => {
    expect(wallet.page).toBeTruthy();
  });

  test('should leave motion alone on the dapp', async ({ page }) => {
    await page.goto('http://localhost:8080');

    const prefersReducedMotion = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    expect(prefersReducedMotion).toBe(false);
  });

  test('should open the wallet itself if the wallet did not', async ({}, info) => {
    test.setTimeout(300_000);

    const options = info.project.metadata as OfficialOptions;
    const wallet = options.wallet === 'metamask' ? MetaMaskWallet : CoinbaseWallet;
    const userDataDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'dappwright-open-home-'));
    const browserContext = await launchBrowser(wallet, userDataDir, {
      ...options,
      headless: info.project.use.headless,
    });

    // Only MetaMask opens its own tab, so take that away from it
    if (wallet.opensHomeOnInstall) {
      const ownTab = await browserContext.waitForEvent('page', { timeout: 240_000 });
      await ownTab.close();
    }

    const walletPage = await openWalletHome(wallet.id, browserContext);
    await walletPage.waitForLoadState('domcontentloaded');
    expect(walletPage.url()).toContain(wallet.homePath);
    if (wallet === MetaMaskWallet)
      await walletPage.getByTestId('onboarding-import-wallet').waitFor({ timeout: 120_000 });

    await browserContext.close();
    await fs.promises.rm(userDataDir, { recursive: true, force: true });
  });
});
