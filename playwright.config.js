import { defineConfig } from '@playwright/test';
import { CoinbaseWallet, MetaMaskWallet } from './src';

export default defineConfig({
  workers: 1,
  webServer: {
    command: 'yarn test:dapp',
    url: 'http://localhost:8080',
    timeout: 120 * 1000,
    reuseExistingServer: false,
  },
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
