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

  closeWalletSetupPopup(wallet.id, browserContext);

  return {
    wallet: await getWallet(wallet.id, browserContext),
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

  if (options.headless != false) browserArgs.push(`--headless=new`);
  return await playwright.chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: browserArgs,
  });
}
