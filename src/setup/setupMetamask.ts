import { BrowserContext, Page } from 'playwright';

import { getMetamask } from '../metamask';
import { Dappeteer, MetamaskOptions } from '../types';

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
): Promise<Dappeteer> {
  const page = await getWelcomScreen(browserContext);

  await page.reload();
  // goes through the installation steps required by metamask
  for (const step of steps) {
    await step(page, options);
  }

  return getMetamask(page);
}

const getWelcomScreen = async (browserContext: BrowserContext): Promise<Page> => {
  console.log('Welcome pages', browserContext.pages().length);
  if (browserContext.pages().length > 1) return browserContext.pages()[1]; // Sometime the page loads before the script
  return await browserContext.waitForEvent('page');
};
