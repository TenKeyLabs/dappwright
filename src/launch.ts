import fs from 'fs';
import os from 'os';
import * as path from 'path';
import playwright, { BrowserContext } from 'playwright-core';

import { DappwrightLaunchResponse, OfficialOptions } from './types';
import { closeWalletSetupPopup, getWallet, getWalletType, WalletTypes } from './wallets/wallets';

/**
 * Launch Playwright chromium instance with wallet plugin installed
 * */

export async function launch(browserName: string, options: OfficialOptions): Promise<DappwrightLaunchResponse> {
  const { ...officialOptions } = options;
  const wallet = getWalletType(officialOptions.wallet);
  if (!wallet) throw new Error('Wallet not supported');

  const userDataDir = await resetBrowserSession(options);
  const browserContext = await launchBrowser(wallet, userDataDir, officialOptions);

  const walletInstance = await getWallet(wallet.id, browserContext);
  await closeWalletSetupPopup(wallet.id, browserContext, walletInstance.page);

  return {
    wallet: walletInstance,
    browserContext,
  };
}

async function resetBrowserSession(options: OfficialOptions): Promise<string> {
  const workerIndex = process.env.TEST_WORKER_INDEX || '0';
  const sessionPath = path.resolve(os.tmpdir(), 'dappwright', 'session');
  const userDataDir = path.join(sessionPath, options.wallet, workerIndex);

  await fs.promises.rm(userDataDir, { recursive: true, force: true });

  const prefsDir = path.join(userDataDir, 'Default');
  await fs.promises.mkdir(prefsDir, { recursive: true });
  await fs.promises.writeFile(
    path.join(prefsDir, 'Preferences'),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JSON.stringify({ intl: { accept_languages: 'en', selected_languages: 'en' } }),
  );
  return userDataDir;
}

async function launchBrowser(
  wallet: WalletTypes,
  userDataDir: string,
  options: OfficialOptions,
): Promise<BrowserContext> {
  const extensionPath = await wallet.download(options);
  const extensionList = [extensionPath].concat(options.additionalExtensions || []);
  const browserArgs = [
    `--disable-extensions-except=${extensionList.join(',')}`,
    `--load-extension=${extensionList.join(',')}`,
  ];

  if (options.headless != false) {
    browserArgs.push(`--headless=new`);
    // Headless Chromium's virtual screen defaults to 800x600, which is smaller than the
    // browser window. Wallets right-align their approval popup to the browser window
    // (MetaMask: left = window.left + window.width - 400), so chrome.windows.create lands
    // off-screen and is rejected with "Bounds must be at least 50% within visible screen
    // space." The rejection escapes the wallet's own error handling, so the approval never
    // opens and every popup-driven action hangs. A larger virtual screen keeps the popup
    // in bounds. This does not affect page viewports, which Playwright emulates separately.
    browserArgs.push(`--screen-info={1920x1080}`);
  }
  return await playwright.chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: browserArgs,
  });
}
