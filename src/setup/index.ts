import { BrowserContext, Page } from 'playwright-core';

import { Dappwright, MetamaskOptions, OfficialOptions } from '../types';

import fs from 'fs';
import { launch } from './launch';
import { setupMetamask } from './setupMetamask';

export * from './launch';
export * from './setupMetamask';

export const bootstrap = async (
  browserName: string,
  { seed, password, showTestNets, ...launchOptions }: OfficialOptions & MetamaskOptions,
): Promise<[Dappwright, Page, BrowserContext]> => {
  fs.rmSync('./metamaskSession', { recursive: true, force: true });
  const browserContext = await launch(browserName, launchOptions);
  const dappwright = await setupMetamask(browserContext, { seed, password, showTestNets });
  const pages = await browserContext.pages();

  return [dappwright, pages[0], browserContext];
};
