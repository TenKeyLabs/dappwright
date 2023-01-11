import { Dappwright } from '../../src';
import { CoinbaseWallet } from '../../src/wallets/coinbase/coinbase';
import { MetaMaskWallet } from '../../src/wallets/metamask/metamask';
import { WalletTypes } from '../../src/wallets/wallets';

const conditionalCallback = (
  wallet: Dappwright,
  walletType: WalletTypes,
  callback: () => Promise<void>,
): Promise<void> => {
  if (wallet instanceof walletType) {
    return callback();
  } else {
    return new Promise<void>((resolve) => {
      console.warn(expect.getState().currentTestName);
      resolve();
    });
  }
};

// For wallet logic within an test
export const forMetaMask = (wallet: Dappwright, callback: () => Promise<void>): Promise<void> => {
  return conditionalCallback(wallet, MetaMaskWallet, callback);
};

export const forCoinbase = (wallet: Dappwright, callback: () => Promise<void>): Promise<void> => {
  return conditionalCallback(wallet, CoinbaseWallet, callback);
};
