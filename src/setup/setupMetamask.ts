import { BrowserContext, Page } from 'playwright-core';

import { getMetamask } from '../metamask';
import { Dappwright, MetamaskOptions } from '../types';

import { closePopup, confirmWelcomeScreen, importAccount, noThanksTelemetry, showTestNets } from './setupActions';

/**
 * Setup MetaMask with base account
 * */
type Step<Options> = (page: Page, options?: Options) => void;
const defaultMetamaskSteps: Step<MetamaskOptions>[] = [
  confirmWelcomeScreen,
  noThanksTelemetry,
  importAccount,
  closePopup,
  showTestNets,
];

export async function setupMetamask<Options = MetamaskOptions>(
  browserContext: BrowserContext,
  options?: Options,
  steps: Step<Options>[] = defaultMetamaskSteps,
): Promise<Dappwright> {
  const page = await getWelcomeScreen(browserContext);

  // goes through the installation steps required by metamask
  for (const step of steps) {
    await step(page, options);
  }

  return getMetamask(page);
}

const getWelcomeScreen = async (browserContext: BrowserContext): Promise<Page> => {
  const page = await browserContext.waitForEvent('page');

  await page.waitForLoadState('domcontentloaded');
  await page.reload();

  return page;
};
