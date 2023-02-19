import { defineConfig } from '@playwright/test';
import { CoinbaseWallet, MetaMaskWallet, sessionPath } from './src';
export default defineConfig({
  globalSetup: 'test/helpers/globalSetup.ts',
  workers: 1,
  projects: [
    {
      name: 'MetaMask',
      metadata: {
        wallet: 'metamask',
        version: MetaMaskWallet.recommendedVersion,
        seed: 'pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog',
        password: 'password1234!@#$',
      },
    },
    {
      name: 'Coinbase',
      metadata: {
        wallet: 'coinbase',
        version: CoinbaseWallet.recommendedVersion,
        seed: 'pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog',
        password: 'password1234!@#$',
      },
    },
  ],
});
