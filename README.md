# dAppwright

E2E testing for dApps using Playwright + MetaMask & Coinbase Wallet

## Installation

```
$ npm install -s @tenkeylabs/dappwright
$ yarn add @tenkeylabs/dappwright
```

## Usage

### Quick setup with Hardhat

```typescript
  # test.spec.ts

  import { BrowserContext, expect, test as baseTest } from "@playwright/test";
  import dappwright, { Dappwright, MetaMaskWallet } from "@tenkeylabs/dappwright";

  export const test = baseTest.extend<{
    context: BrowserContext;
    wallet: Dappwright;
  }>({
    context: async ({}, use) => {
      // Launch context with extension
      const [wallet, _, context] = await dappwright.bootstrap("", {
        wallet: "metamask",
        version: MetaMaskWallet.recommendedVersion,
        seed: "test test test test test test test test test test test junk", // Hardhat's default https://hardhat.org/hardhat-network/docs/reference#accounts
        headless: false,
      });

      // Add Hardhat as a custom network
      await wallet.addNetwork({
        networkName: "Hardhat",
        rpc: "http://localhost:8546",
        chainId: 31337,
        symbol: "ETH",
      });

      await use(context);
    },

    wallet: async ({ context }, use) => {
      const metamask = await dappwright.getWallet("metamask", context);

      await use(metamask);
    },
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080");
  });

  test("should be able to connect", async ({ wallet, page }) => {
    await page.click("#connect-button");
    await wallet.approve();

    const connectStatus = page.getByTestId("connect-status");
    expect(connectStatus).toHaveValue("connected");

    await page.click("#switch-network-button");

    const networkStatus = page.getByTestId("network-status");
    expect(networkStatus).toHaveValue("31337");
  });
```

### Alternative Setups

There are a number of different ways integrate dAppwright into your test suite. For some other examples, please check out dAppwright's [example application repo](https://github.com/TenKeyLabs/dappwright-examples).

## Special Thanks

This project is a fork of the [Chainsafe](https://github.com/chainsafe/dappeteer) and [Decentraland](https://github.com/decentraland/dappeteer) version of dAppeteer.
