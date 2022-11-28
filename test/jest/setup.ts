import { getWallet, launch } from '../../src/index';

import { getDappwrightConfig } from './config';

export default async function (browserName: string): Promise<void> {
  const { dappwright: dappwrightConfig } = await getDappwrightConfig();

  const dappwright = await launch(browserName, dappwrightConfig);
  try {
    const wallet = await getWallet('metamask', dappwright.browserContext);
    await wallet.setup();
    global.browser = dappwright.browserContext;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    throw error;
  }
}
