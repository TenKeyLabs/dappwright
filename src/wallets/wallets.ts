import { BrowserContext, Page } from 'playwright-core';
import { CoinbaseWallet } from './coinbase/coinbase';
import { MetaMaskWallet } from './metamask/metamask';

export type Step<Options> = (page: Page, options?: Options) => void;
export type WalletIdOptions = 'metamask' | 'coinbase';
export type WalletTypes = typeof CoinbaseWallet | typeof MetaMaskWallet;
export type WalletOptions = {
  seed?: string;
  password?: string;
  showTestNets?: boolean;
};

export const WALLETS: WalletTypes[] = [CoinbaseWallet, MetaMaskWallet];

export const getWalletType = (id: WalletIdOptions): WalletTypes => {
  const walletType = WALLETS.find((wallet) => {
    return wallet.id === id;
  });

  if (!walletType) throw new Error(`Wallet ${id} not supported`);

  return walletType;
};

export const getWallet = async (id: WalletIdOptions, browserContext: BrowserContext): Promise<MetaMaskWallet> => {
  const wallet = getWalletType(id);

  if (browserContext.pages().length === 1) {
    try {
      // Wait for the wallet to pop up
      const page = await browserContext.waitForEvent('page', { timeout: 1000 });
      return new wallet(page);
    } catch {
      // Open the wallet manually if tab doesn't pop up
      const page = await browserContext.newPage();

      // Go to internal system page to list installed extensions
      await page.goto('chrome://system/');
      await page.waitForSelector('//button[@id="extensions-value-btn"]', { timeout: 5000 });
      await page.getByRole('button', { name: 'Expand all…' }).click();

      // Extract extension id
      const extensionsEl = await page.waitForSelector('//*[@id="extensions-value"]');
      const extensionsContext = (await extensionsEl.textContent()).split(/ : |\n/);
      const walletNameIndex = extensionsContext.findIndex((context: string) =>
        context.toLowerCase().includes(wallet.id),
      );
      const extensionId = extensionsContext[walletNameIndex - 1];

      // Load extension homepage
      await page.goto(`chrome-extension://${extensionId}${wallet.homePath}`);

      return new wallet(page);
    }
  }

  const page = browserContext.pages()[1];
  return new wallet(page);
};
