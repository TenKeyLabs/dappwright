import { launch, setupMetamask } from '../index';

import { getDappwrightConfig } from './config';

export default async function (browserName: string): Promise<void> {
  const { dappwright, metamask } = await getDappwrightConfig();

  const browserContext = await launch(browserName, dappwright);
  try {
    await setupMetamask(browserContext, metamask);
    global.browser = browserContext.browser();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    throw error;
  }
}
