# Changelog

## 2.2.2

### Patch Changes

- [#68](https://github.com/TenKeyLabs/dappwright/pull/68) [`c24d645`](https://github.com/TenKeyLabs/dappwright/commit/c24d64545545a7af27a8bb3d551219ffdbbc2495) Thanks [@osis](https://github.com/osis)! - Support for MetaMask 10.25.0

## 2.2.1

### Minor Changes

- [#66](https://github.com/TenKeyLabs/dappwright/pull/66) [`9f551e2`](https://github.com/TenKeyLabs/dappwright/commit/9f551e2c7354e86809835357adc5c0314102c783) Thanks [@witem](https://github.com/witem)! - Add headless option to bootstrap

### Patch Changes

- [#64](https://github.com/TenKeyLabs/dappwright/pull/64) [`e7a3eed`](https://github.com/TenKeyLabs/dappwright/commit/e7a3eeda9ce23a9afca96dbd5d82652795809bca) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump jest from 29.3.1 to 29.4.1

- [#65](https://github.com/TenKeyLabs/dappwright/pull/65) [`bbc88af`](https://github.com/TenKeyLabs/dappwright/commit/bbc88af5c68b9755e963868cf99f55a2f0ff1a04) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump playwright-core from 1.29.2 to 1.30.0

- [#62](https://github.com/TenKeyLabs/dappwright/pull/62) [`672f0b1`](https://github.com/TenKeyLabs/dappwright/commit/672f0b19ad8c79055ae4f40eb2df3ccf8476aa9c) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump typescript from 4.9.4 to 4.9.5

- [#63](https://github.com/TenKeyLabs/dappwright/pull/63) [`62ea98a`](https://github.com/TenKeyLabs/dappwright/commit/62ea98a1406e41648f2d477f343e769cd42aaf51) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump solc from 0.8.17 to 0.8.18

- [#61](https://github.com/TenKeyLabs/dappwright/pull/61) [`cd2caaa`](https://github.com/TenKeyLabs/dappwright/commit/cd2caaab84ef0636542d15b47e25cc021fe25592) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump ganache from 7.7.3 to 7.7.4

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
