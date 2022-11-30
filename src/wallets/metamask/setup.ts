import { Page } from 'playwright-core';
import { Step, WalletOptions } from '../wallets';

/**
 * Setup MetaMask with base account
 * */

export const setup =
  (page: Page, defaultMetamaskSteps: Step<WalletOptions>[]) =>
  async <Options = WalletOptions>(options?: Options, steps: Step<Options>[] = defaultMetamaskSteps): Promise<void> => {
    // goes through the installation steps required by metamask
    for (const step of steps) {
      await step(page, options);
    }
  };
