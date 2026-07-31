import { defineConfig } from '@playwright/test';
import { CoinbaseWallet, MetaMaskWallet } from './src';

export default defineConfig({
  testIgnore: '**/*.test.ts',
  globalSetup: './test/helpers/globalSetup.ts',
  retries: process.env.CI ? 1 : 0,
  timeout: process.env.CI ? 120000 : 60000,
  use: {
    trace: process.env.CI ? 'retain-on-first-failure' : 'on'
  },
  maxFailures: process.env.CI ? 0 : 1,
  reporter: [['list'], ['html', { open: 'on-failure' }]],
  webServer: {
    command: 'cd test/dapp && yarn start',
    url: 'http://localhost:8080',
    timeout: 120 * 1000,
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'MetaMask',
      // One browser per wallet: the spec files share a chain account, and a single worker also
      // means the wallet is bootstrapped once for the project instead of once per file
      workers: 1,
      metadata: {
        wallet: 'metamask',
        version: MetaMaskWallet.recommendedVersion,
        seed: 'pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog',
        password: 'password1234!@#$',
      },
    },
    {
      name: 'Coinbase',
      workers: 1,
      metadata: {
        wallet: 'coinbase',
        version: CoinbaseWallet.recommendedVersion,
        seed: 'pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog',
        password: 'password1234!@#$',
        // Both projects import this seed, and the test chain funds the accounts derived from
        // it, so MetaMask and Coinbase would otherwise drive the same address. Pointing
        // Coinbase at the second derived account - funded just like the first - keeps the two
        // projects off each other's nonce while they run together.
        account: 'Address 2',
      },
    },
  ],
});
