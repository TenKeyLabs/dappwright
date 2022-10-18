# dAppwright

E2E testing for dApps using Playwright + MetaMask

This is a fork of [dAppeteer](github.com/chainsafe/dappeteer)

## Installation

```
$ npm install -s @tenkeylabs/dappwright
$ yarn add @tenkeylabs/dappwright
```

## Usage

```typescript
# global-setup.ts

import dappwright from "dappwright";
import playwright  from 'playwright';

async function globalSetup(config: FullConfig) {
  const [metamask, page, context] = await dappwright.bootstrap("", {
    metamaskVersion: "v10.20.0",
  });

  // Add a custom network
  await metamask.addNetwork({
    networkName: "Hardhat",
    rpc: "http://127.0.0.1:8545/",
    chainId: 31337,
    symbol: "ETH",
  });

  // Add an extra account
  await metamask.createAccount();
  await page.waitForTimeout(3000); // Metamask needs some time to commit changes to disk

  await context.close();
}

main();
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
      metamaskVersion: "v10.20.0",
    });

    // Unlock the wallet
    const metamaskPage = await context.waitForEvent("page");
    const metamask = await dappwright.getMetamask(metamaskPage);
    await metamask.unlock();

    await use(context);
    await context.close();
  },
  metamask: async ({ context }, use) => {
    const metamaskPage = context.pages()[1];
    const metamask = await dappwright.getMetamask(metamaskPage);

    await use(metamask);
  },
});

test("can connect to an application", async ({ page, metamask }) => {
  await page.locator("text=MetaMask").click();
  await metamask.approve();
  await page.waitForUrl("http://localhost:3000/dashboard");
})
```
