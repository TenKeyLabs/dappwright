// re-export

import { bootstrap } from './bootstrap';
import { launch } from './launch';
import { getWallet } from './wallets/wallets';

const defaultObject = { bootstrap, launch, getWallet };
export default defaultObject;

export { bootstrap } from './bootstrap';
export { launch } from './launch';
export * from './types';
export { CoinbaseWallet } from './wallets/coinbase/coinbase';
export { MetaMaskWallet } from './wallets/metamask/metamask';
export { getWallet } from './wallets/wallets';
