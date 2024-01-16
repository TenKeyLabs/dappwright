import fs from 'fs';
import os from 'os';
import * as path from 'path';
import playwright from 'playwright-core';

import { DappwrightLaunchResponse, OfficialOptions } from './types';
import { getWallet, getWalletType } from './wallets/wallets';

/**
 * Launch Playwright chromium instance with wallet plugin installed
 * */
export const sessionPath = path.resolve(os.tmpdir(), 'dappwright', 'session');

export async function launch(browserName: string, options: OfficialOptions): Promise<DappwrightLaunchResponse> {
  const { ...officialOptions } = options;
  const wallet = getWalletType(officialOptions.wallet);
  if (!wallet) throw new Error('Wallet not supported');

  const extensionPath = await wallet.download(officialOptions);
  const extensionList = [extensionPath].concat(officialOptions.additionalExtensions || []);

  const browserArgs = [
    `--disable-extensions-except=${extensionList.join(',')}`,
    `--load-extension=${extensionList.join(',')}`,
  ];

  if (options.headless != false) browserArgs.push(`--headless=new`);

  const workerIndex = process.env.TEST_WORKER_INDEX || '0';
  const userDataDir = path.join(sessionPath, options.wallet, workerIndex);

  fs.rmSync(userDataDir, { recursive: true, force: true });

  const browserContext = await playwright.chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: browserArgs,
  });

  return {
    wallet: await getWallet(wallet.id, browserContext),
    browserContext,
  };
}
