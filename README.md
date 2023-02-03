# dAppwright

E2E testing for dApps using Playwright + MetaMask

This is a fork of [dAppeteer](https://github.com/chainsafe/dappeteer)

## Installation

```
$ npm install -s @tenkeylabs/dappwright
$ yarn add @tenkeylabs/dappwright
```

## Usage

```typescript
# global-setup.ts

import dappwright, { CoinbaseWallet, MetaMaskWallet } from "@tenkeylabs/dappwright";
import playwright  from 'playwright';

async function globalSetup(config: FullConfig) {
  const [metamask, page, context] = await dappwright.bootstrap("", {
    wallet: "metamask",
    version: MetaMaskWallet.recommendedVersion,
  });

  // Add Hardhet network
  await metamask.addNetwork({
    networkName: "Hardhat",
    rpc: "http://127.0.0.1:8545/",
    chainId: 31337,
    symbol: "ETH",
  });

  // Add an extra account
  await metamask.createAccount();

  await context.close();
}

export default globalSetup;
```

```typescript
# example.spec.ts

export const test = base.extend<{
  context: BrowserContext;
  metamask: Dappwright;
}>({
  context: async ({}, use) => {
    // Launch context with the same session from global-setup
    const context: BrowserContext = await dappwright.launch("", {
      metamaskVersion: MetaMaskWallet.recommendedVersion,
    });

    // Unlock the wallet
    await metamask.unlock();

    await use(context);
    await context.close();
  },
  metamask: async ({ context }, use) => {
    const metamask = await dappwright.getWallet("metamask", context);

    await use(metamask);
  },
});

test.describe.configure({ mode: "serial" }); // Avoid colliding browser sessions
test("can connect to an application", async ({ page, metamask }) => {
  // Click a connect wallet button
  await page.locator("text=MetaMask").click();

  // Approve the connection when MetaMask pops up
  await metamask.approve();

  // Wait for the dapp to redirect
  await page.waitForUrl("http://localhost:3000/dashboard");
})
```
