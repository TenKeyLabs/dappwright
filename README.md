# dAppwright

E2E testing for dApps using Playwright + MetaMask & Coinbase Wallet

<p float="left">
  <img src="https://github.com/user-attachments/assets/e3da5de5-4665-4774-bf1a-5565b52ce175" width="49%" />
  <img src="https://github.com/user-attachments/assets/cc95ca6b-b3d9-4f5c-bac1-40d9477a679f" width="49%" />
</p>

## Installation

```
$ npm install -s @tenkeylabs/dappwright
$ yarn add @tenkeylabs/dappwright
```

## Usage

### Quick setup with Hardhat

```typescript
  # test.spec.ts

  import { test as base, expect } from '@playwright/test';
  import { BrowserContext } from 'playwright-core';
  import { bootstrap, Dappwright, getWallet, MetaMaskWallet } from '@tenkeylabs/dappwright';

  export const test = base.extend<{ wallet: Dappwright }, { walletContext: BrowserContext }>({
    walletContext: [
      async ({}, use) => {
        // Launch context with extension
        const [wallet, _, context] = await bootstrap("", {
          wallet: "metamask",
          version: MetaMaskWallet.recommendedVersion,
          seed: "test test test test test test test test test test test junk", // Hardhat's default https://hardhat.org/hardhat-network/docs/reference#accounts
          headless: false,
        });

        await use(context);
        await context.close();
      },
      { scope: 'worker' },
    ],
    context: async ({ walletContext }, use) => {
      await use(walletContext);
    },
    wallet: async ({ walletContext }, use) => {
      const wallet = await getWallet("metamask", walletContext);
      await use(wallet);
    },
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080");
  });

  test("should be able to connect", async ({ wallet, page }) => {
    await page.click("#connect-button");
    await wallet.approve();

    const connectStatus = page.getByTestId("connect-status");
    await expect(connectStatus).toHaveValue("connected");

    await page.click("#switch-network-button");

    const networkStatus = page.getByTestId("network-status");
    await expect(networkStatus).toHaveValue("31337");
  });
```

### Alternative Setups

There are a number of different ways integrate dAppwright into your test suite. For some other examples, please check out dAppwright's [example application repo](https://github.com/TenKeyLabs/dappwright-examples).

## Special Thanks

This project is a fork of the [Chainsafe](https://github.com/chainsafe/dappeteer) and [Decentraland](https://github.com/decentraland/dappeteer) version of dAppeteer.
