# dAppwright API

Methods provided by dAppwright.
For additional information read root [readme](../README.md)

- [Launch dAppwright](#launch)
- [Setup Metamask](#setup)
- [Bootstrap dAppwright](#bootstrap)
- [Get Metamask Window](#getMetamask)
- [dAppwright methods](#methods)
  - [switchAccount](#switchAccount)
  - [importPK](#importPK)
  - [lock](#lock)
  - [unlock](#unlock)
  - [switchNetwork](#switchNetwork)
  - [addNetwork](#addNetwork)
  - [addToken](#addToken)
  - [confirmTransaction](#confirmTransaction)
  - [sign](#sign)
  - [approve](#approve)
  - [helpers](#helpers)
    - [getTokenBalance](#getTokenBalance)
    - [deleteAccount](#deleteAccount)
    - [deleteNetwork](#deleteNetwork)
  - [page](#page)

# dAppwright setup methods

<a name="launch"></a>

## `dappwright.launch(browserName: string, options: OfficialOptions | CustomOptions): Promise<Browser>`

```typescript
interface OfficialOptions {
  metamaskVersion: 'latest' | string;
  metamaskLocation?: Path;
}

type Path = string | { download: string; extract: string };
```

or

```typescript
interface CustomOptions {
  metamaskPath: string;
}
```

returns an instance of `browser` same as `playwright.launch`, but it also installs the MetaMask extension. [It supports all the regular `playwright.launch` options](https://playwright.dev/docs/api/class-browser#browser-new-context)

<a name="setup"></a>

## `dappwright.setupMetamask(browser: BrowserContext, options: MetamaskOptions = {}, steps: Step[]): Promise<Dappwright>`

```typescript
interface MetamaskOptions {
  seed?: string;
  password?: string;
  showTestNets?: boolean;
}
```

```typescript
type Step = (page: Page, options?: Options) => void;
```

<a name="bootstrap"><a/>

## `dappwright.bootstrap(puppeteerLib: typeof puppeteer, options: OfficialOptions & MetamaskOptions): Promise<[Dappwright, Page, Browser]>`

```typescript
interface OfficialOptions {
  metamaskVersion: 'latest' | string;
  metamaskLocation?: Path;
}
```

it runs `dappwright.launch` and `dappwright.setup` and return array with dappwright, page and browser

<a name="getMetamask"></a>

## `dappwright.getMetamaskWindow(browser: Browser, version?: string): Promise<Dappwright>`

<a name="methods"></a>

# dAppwright methods

`metamask` is used as placeholder for dAppwright returned by [`setupMetamask`](setup) or [`getMetamaskWindow`](getMetamask)

<a name="switchAccount"></a>

## `metamask.switchAccount(accountNumber: number): Promise<void>`

it commands MetaMask to switch to a different account, by passing the index/position of the account in the accounts list.

<a name="importPK"></a>

## `metamask.importPK(privateKey: string): Promise<void>`

it commands MetaMask to import an private key. It can only be used while you haven't signed in yet, otherwise it throws.

<a name="lock"></a>

## `metamask.lock(): Promise<void>`

signs out from MetaMask. It can only be used if you arelady signed it, otherwise it throws.

<a name="unlock"></a>

## `metamask.unlock(password: string): Promise<void>`

it unlocks the MetaMask extension. It can only be used in you locked/signed out before, otherwise it throws. The password is optional, it defaults to `password1234`.

<a name="switchNetwork"></a>

## `metamask.switchNetwork(network: string): Promise<void>`

it changes the current selected network. `networkName` can take the following values: `"main"`, `"ropsten"`, `"rinkeby"`, `"kovan"`, `"localhost"`.

<a name="addNetwork"></a>

## `metamask.addNetwork(options: AddNetwork): Promise<void>`

```typescript
interface AddNetwork {
  networkName: string;
  rpc: string;
  chainId: number;
  symbol: string;
}
```

it adds a custom network to MetaMask.

<a name="addToken"></a>

## `metamask.addToken(tokenAddress: string): Promise<void>`

```typescript
interface AddToken {
  tokenAddress: string;
  symbol?: string;
  decimals?: number;
}
```

it adds a custom token to MetaMask.

<a name="confirmTransaction"></a>

## `metamask.confirmTransaction(options?: TransactionOptions): Promise<void>`

```typescript
interface TransactionOptions {
  gas?: number;
  gasLimit?: number;
  priority?: number;
}
```

commands MetaMask to submit a transaction. For this to work MetaMask has to be in a transaction confirmation state (basically promting the user to submit/reject a transaction). You can (optionally) pass an object with `gas` and/or `gasLimit`, by default they are `20` and `50000` respectively.

<a name="sign"></a>

## `metamask.sign(): Promise<void>`

commands MetaMask to sign a message. For this to work MetaMask must be in a sign confirmation state.

<a name="approve"></a>

## `metamask.approve(): Promise<void>`

enables the app to connect to MetaMask account in privacy mode

<a name="helpers"></a>

## `metamask.helpers`

<a name="getTokenBalance"></a>

### `metamask.helpers.getTokenBalance(tokenSymbol: string): Promise<number>`

get balance of specific token

<a name="deleteAccount"></a>

### `metamask.helpers.deleteAccount(accountNumber: number): Promise<void>`

deletes account containing name with specified number

<a name="deleteNetwork"></a>

### `metamask.helpers.deleteNetwork(): Promise<void>`

deletes custom network from metamask

<a name="page"></a>

## `metamask.page` is Metamask plugin `Page`

**for advanced usages** in case you need custom features.
