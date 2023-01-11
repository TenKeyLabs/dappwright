import * as dappwright from '../../src/index';
import { MetaMaskWallet } from '../../src/wallets/metamask/metamask';
import { start } from '../dapp';

export default async function (): Promise<void> {
  await start();

  const [_, __, browserContext] = await dappwright.bootstrap('', {
    wallet: 'metamask',
    version: process.env.METAMASK_VERSION || MetaMaskWallet.recommendedVersion,
    seed: 'pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog',
    password: 'password1234',
  });

  await browserContext.close();

  globalThis.browserContext = browserContext;
}
