import { BrowserContext, Page } from 'playwright';

import { Dappeteer, MetamaskOptions, OfficialOptions } from '../types';

import fs from 'fs';
import { launch } from './launch';
import { setupMetamask } from './setupMetamask';

export * from './launch';
export * from './setupMetamask';

export const bootstrap = async (
  browserName: string,
  { seed, password, showTestNets, ...launchOptions }: OfficialOptions & MetamaskOptions,
): Promise<[Dappeteer, Page, BrowserContext]> => {
  fs.rmSync('./metamaskSession', { recursive: true, force: true });
  const browserContext = await launch(browserName, launchOptions);
  const dappeteer = await setupMetamask(browserContext, { seed, password, showTestNets });
  console.log('SETUP DONE');
  const pages = await browserContext.pages();

  return [dappeteer, pages[0], browserContext];
};
