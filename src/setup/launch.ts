import playwright from 'playwright';

import { CustomOptions, LaunchOptions, OfficialOptions } from '../types';
import { RECOMMENDED_METAMASK_VERSION } from './constants';

import { isNewerVersion } from './isNewerVersion';
import downloader from './metamaskDownloader';

/**
 * Launch Puppeteer chromium instance with MetaMask plugin installed
 * */
export async function launch(browserName: string, options: LaunchOptions): Promise<playwright.BrowserContext> {
  if (!options || (!options.metamaskVersion && !(options as CustomOptions).metamaskPath))
    throw new Error(
      `Please provide "metamaskVersion" (recommended "${RECOMMENDED_METAMASK_VERSION}" or "latest" to always get latest release of MetaMask)`,
    );

  const { args, ...rest } = options;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  let METAMASK_PATH;
  if (options.metamaskVersion) {
    const { metamaskVersion, metamaskLocation } = rest as OfficialOptions;
    /* eslint-disable no-console */
    console.log(); // new line
    if (metamaskVersion === 'latest')
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `It is not recommended to run metamask with "latest" version. Use it at your own risk or set to the recommended version "${RECOMMENDED_METAMASK_VERSION}".`,
      );
    else if (isNewerVersion(RECOMMENDED_METAMASK_VERSION, metamaskVersion))
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `Seems you are running newer version of MetaMask that recommended by dappeteer team.
      Use it at your own risk or set to the recommended version "${RECOMMENDED_METAMASK_VERSION}".`,
      );
    else if (isNewerVersion(metamaskVersion, RECOMMENDED_METAMASK_VERSION))
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `Seems you are running older version of MetaMask that recommended by dappeteer team.
      Use it at your own risk or set the recommended version "${RECOMMENDED_METAMASK_VERSION}".`,
      );
    else console.log(`Running tests on MetaMask version ${metamaskVersion}`);

    console.log(); // new line

    METAMASK_PATH = await downloader(metamaskVersion, metamaskLocation);
  } else {
    console.log(`Running tests on local MetaMask build`);

    METAMASK_PATH = (rest as CustomOptions).metamaskPath;
    /* eslint-enable no-console */
  }

  return playwright.chromium.launchPersistentContext('./metamaskSession', {
    headless: false,
    args: [`--disable-extensions-except=${METAMASK_PATH}`, `--load-extension=${METAMASK_PATH}`, ...(args || [])],
    ...rest,
  });
}
