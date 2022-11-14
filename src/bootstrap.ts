import fs from 'fs';
import { BrowserContext, Page } from 'playwright-core';
import { launch } from './launch';
import { Dappwright, OfficialOptions } from './types';
import { MetaMaskOptions } from './wallets/metamask';
import { setupMetamask } from './wallets/metamask/setup';

export const bootstrap = async (
  browserName: string,
  { seed, password, showTestNets, ...launchOptions }: OfficialOptions & MetaMaskOptions,
): Promise<[Dappwright, Page, BrowserContext]> => {
  fs.rmSync('./metamaskSession', { recursive: true, force: true });
  const browserContext = await launch(browserName, launchOptions);
  const dappwright = await setupMetamask(browserContext, { seed, password, showTestNets });
  const pages = await browserContext.pages();

  return [dappwright, pages[0], browserContext];
};
