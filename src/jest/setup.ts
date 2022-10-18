import { launch, setupMetamask } from '../index';

import { getDappeteerConfig } from './config';

export default async function (browserName: string): Promise<void> {
  const { dappeteer, metamask } = await getDappeteerConfig();

  const browserContext = await launch(browserName, dappeteer);
  try {
    await setupMetamask(browserContext, metamask);
    global.browser = browserContext.browser();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    throw error;
  }
  // process.env.PUPPETEER_WS_ENDPOINT = (browser.contexts[0] as BrowserContext).
}
