import { BrowserContext, Page } from 'playwright-core';
import { launch } from './launch';
import { Dappwright, OfficialOptions } from './types';
import { closeWalletSetupPopup, getWallet, WalletOptions } from './wallets/wallets';

export const bootstrap = async (
  browserName: string,
  { seed, password, showTestNets, ...launchOptions }: OfficialOptions & WalletOptions,
): Promise<[Dappwright, Page, BrowserContext]> => {
  const { browserContext } = await launch(browserName, launchOptions);
  closeWalletSetupPopup(launchOptions.wallet, browserContext);
  const wallet = await getWallet(launchOptions.wallet, browserContext);
  await wallet.setup({ seed, password, showTestNets });

  return [wallet, wallet.page, browserContext];
};
