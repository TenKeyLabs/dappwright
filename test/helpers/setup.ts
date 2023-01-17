import { BrowserContext } from 'playwright-core';
import * as dappwright from '../../src/index';
import { CoinbaseWallet } from '../../src/wallets/coinbase/coinbase';
import { MetaMaskWallet } from '../../src/wallets/metamask/metamask';
import { start } from '../dapp/server';

export default async function (): Promise<void> {
  // Start test dapp
  await start();

  // Setup wallets
  const values = await Promise.all([
    dappwright.bootstrap('', {
      wallet: 'metamask',
      version: MetaMaskWallet.recommendedVersion,
      seed: 'pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog',
      password: 'password1234!@#$',
    }),
    dappwright.bootstrap('', {
      wallet: 'coinbase',
      version: CoinbaseWallet.recommendedVersion,
      seed: 'pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog',
      password: 'password1234!@#$',
    }),
  ]);

  const browserContexts: BrowserContext[] = values.map((value) => value[2]);

  // Close browsers when it's all done
  await Promise.all([browserContexts.map((context) => context.close())]);

  // Globalize to pass context to teardown
  globalThis.browserContexts = browserContexts;
}
