import playwright from 'playwright-core';

import { OfficialOptions } from './types';
import { MetaMask } from './wallets/metamask';

/**
 * Launch Playwright chromium instance with MetaMask plugin installed
 * */
export async function launch(browserName: string, options: OfficialOptions): Promise<playwright.BrowserContext> {
  const extensionPath = await MetaMask.download(options);

  return playwright.chromium.launchPersistentContext('./metamaskSession', {
    headless: false,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
}
