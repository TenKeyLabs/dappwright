import { BrowserContext, Page } from 'playwright-core';
import { launch } from './launch';
import { Dappwright, OfficialOptions } from './types';
import { WalletOptions } from './wallets/wallets';

export const bootstrap = async (
  browserName: string,
  { seed, password, showTestNets, ...launchOptions }: OfficialOptions & WalletOptions,
): Promise<[Dappwright, Page, BrowserContext]> => {
  const { browserContext, wallet } = await launch(browserName, launchOptions);

  await wallet.setup({ seed, password, showTestNets });

  return [wallet, wallet.page, browserContext];
};
