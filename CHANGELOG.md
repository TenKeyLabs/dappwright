# Changelog

## 2.2.0

### Minor Changes

- [#56](https://github.com/TenKeyLabs/dappwright/pull/56) [`381d229`](https://github.com/TenKeyLabs/dappwright/commit/381d22910755a87dfd66df18f38bc2b26883833f) Thanks [@osis](https://github.com/osis)! - export wallet types

### Patch Changes

- [#58](https://github.com/TenKeyLabs/dappwright/pull/58) [`f6bfcab`](https://github.com/TenKeyLabs/dappwright/commit/f6bfcab42eb738ba2b3028db51648ba4affa79a2) Thanks [@osis](https://github.com/osis)! - adds missing await for coinbase account switch click

- [#57](https://github.com/TenKeyLabs/dappwright/pull/57) [`6187ce6`](https://github.com/TenKeyLabs/dappwright/commit/6187ce61e3bb654cf60463c8115c998b9e7de3f0) Thanks [@osis](https://github.com/osis)! - navigate home after coinbase setup

- [#58](https://github.com/TenKeyLabs/dappwright/pull/58) [`f6bfcab`](https://github.com/TenKeyLabs/dappwright/commit/f6bfcab42eb738ba2b3028db51648ba4affa79a2) Thanks [@osis](https://github.com/osis)! - adds missing await for coinbase accountSwitch & deleteNetwork clicks

## 2.1.0

### Minor Changes

- [#29](https://github.com/TenKeyLabs/dappwright/pull/29) [`3a41607`](https://github.com/TenKeyLabs/dappwright/commit/3a4160702861fbf8efa90baad5e416e0c131c190) Thanks [@osis](https://github.com/osis)! - Adds Coinbase Wallet support
  Adds `hasNetwork` action for all wallets
  Adds `confirmNetworkSwitch` action for MetaMask

### Patch Changes

- [#51](https://github.com/TenKeyLabs/dappwright/pull/51) [`8e464ca`](https://github.com/TenKeyLabs/dappwright/commit/8e464cac16609aeb679cc2e8aaf61720e8ac5c3e) Thanks [@osis](https://github.com/osis)! - Fixes extension url mismatch issue

- [#39](https://github.com/TenKeyLabs/dappwright/pull/39) [`e3aecc6`](https://github.com/TenKeyLabs/dappwright/commit/e3aecc61853fb652a590842b4feda51f58f8a08a) Thanks [@osis](https://github.com/osis)! - Fixes import name case mismatch issue
  Adds wallet context to chromium session/download paths
  Changes popup actions behaviour to wait for a natural close event instead of potentially closing immaturely
  Able to handle when the extension doesn't pop up automatically on re-launches
