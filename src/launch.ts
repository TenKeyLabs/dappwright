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
  const wallet = getWalletType(options.wallet);
  if (!wallet) throw new Error('Wallet not supported');

  const extensionPath = await wallet.download(options);

  const browserContext = await playwright.chromium.launchPersistentContext(path.join(sessionPath, options.wallet), {
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });

  return {
    wallet: await getWallet(wallet.id, browserContext),
    browserContext,
  };
}
