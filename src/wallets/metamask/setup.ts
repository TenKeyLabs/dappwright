import { BrowserContext, Page } from 'playwright-core';

import { MetaMask, MetaMaskOptions } from '.';
import { Dappwright } from '../../types';

import { closePopup, confirmWelcomeScreen, importAccount, noThanksTelemetry, showTestNets } from './setup/setupActions';

/**
 * Setup MetaMask with base account
 * */
type Step<Options> = (page: Page, options?: Options) => void;
const defaultMetamaskSteps: Step<MetaMaskOptions>[] = [
  confirmWelcomeScreen,
  noThanksTelemetry,
  importAccount,
  closePopup,
  showTestNets,
];

export async function setupMetamask<Options = MetaMaskOptions>(
  browserContext: BrowserContext,
  options?: Options,
  steps: Step<Options>[] = defaultMetamaskSteps,
): Promise<Dappwright> {
  const page = await getWelcomeScreen(browserContext);

  // goes through the installation steps required by metamask
  for (const step of steps) {
    await step(page, options);
  }

  return new MetaMask(page);
}

const getWelcomeScreen = async (browserContext: BrowserContext): Promise<Page> => {
  const page = await browserContext.waitForEvent('page');

  await page.waitForLoadState('domcontentloaded');
  await page.reload();

  return page;
};
