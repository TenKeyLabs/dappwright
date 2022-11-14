import { Browser, Page } from 'playwright-core';

import { Dappwright, LaunchOptions } from '../../src';
import { MetaMaskOptions } from '../../src/wallets/metamask';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      page: Page;
      browser: Browser;
      metamask: Dappwright;
    }
  }
}

export type DappwrightJestConfig = Partial<{
  dappwright: LaunchOptions;
  metamask: MetaMaskOptions;
}>;
