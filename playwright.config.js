import { defineConfig } from '@playwright/test';
import { CoinbaseWallet, MetaMaskWallet } from './src';

export default defineConfig({
  testIgnore: '**/*.test.ts',
  retries: process.env.CI ? 1 : 0,
  timeout: process.env.CI ? 120000 : 60000,
  use: {
    trace: process.env.CI ? 'retain-on-first-failure' : 'on',
    headless: false,
  },
  maxFailures: process.env.CI ? 0 : 1,
  reporter: [['list'], ['html', { open: 'on-failure' }]],
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
      dependencies: ["MetaMask"],
    },
  ],
});
