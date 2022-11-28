import { BrowserContext, Page } from 'playwright-core';

import { Dappwright, OfficialOptions } from '../../../types';

import fs from 'fs';
import { launch } from '../../../launch';
import { WalletOptions } from '../metamask';
import { setupMetamask } from '../setup';

export * from '../../../launch';
export * from '../setup';

export const bootstrap = async (
  browserName: string,
  { seed, password, showTestNets, ...launchOptions }: OfficialOptions & WalletOptions,
): Promise<[Dappwright, Page, BrowserContext]> => {
  fs.rmSync('./metamaskSession', { recursive: true, force: true });
  const browserContext = await launch(browserName, launchOptions);
  const dappwright = await setupMetamask(browserContext, { seed, password, showTestNets });
  const pages = await browserContext.pages();

  return [dappwright, pages[0], browserContext];
};
