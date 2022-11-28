import { Page } from 'playwright-core';
import { Step, WalletOptions } from '../wallets';

import { closePopup, confirmWelcomeScreen, importAccount, noThanksTelemetry, showTestNets } from './setup/setupActions';

/**
 * Setup MetaMask with base account
 * */
const defaultMetamaskSteps: Step<WalletOptions>[] = [
  confirmWelcomeScreen,
  noThanksTelemetry,
  importAccount,
  closePopup,
  showTestNets,
];

export const setup =
  (page: Page) =>
  async <Options = WalletOptions>(options?: Options, steps: Step<Options>[] = defaultMetamaskSteps): Promise<void> => {
    // goes through the installation steps required by metamask
    for (const step of steps) {
      await step(page, options);
    }
  };
