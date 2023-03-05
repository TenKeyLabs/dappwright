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
      const [wallet, page, context] = await dappwright.bootstrap("", {
        wallet: "metamask",
        version: MetaMaskWallet.recommendedVersion,
        seed: "test test test test test test test test test test test junk", // Hardhat's default https://hardhat.org/hardhat-network/docs/reference#accounts
      });

      // Add Hardhat as a custom network
      // Metamask locks chainIDs on port 8545, use hardhat's --port flag to change - https://hardhat.org/hardhat-network/docs/metamask-issue
      await wallet.addNetwork({
        networkName: "Hardhat",
        rpc: "http://localhost:8546",
        chainId: 31337,
        symbol: "ETH",
      });

      await use(context);
      await context.close();
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

    const connectStatus = await page.inputValue("#connect-status");
    const networkSwitchStatus = await page.inputValue("#network-switch-status");

    expect(connectStatus).toEqual("connected");
    expect(networkSwitchStatus).toEqual("31337");
  });
```

## Special Thanks

This project is a fork of the [Chainsafe](https://github.com/chainsafe/dappeteer) and [Decentraland](https://github.com/decentraland/dappeteer) version of dAppeteer.
