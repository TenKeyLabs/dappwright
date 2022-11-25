import { expect } from 'chai';

import { clickOnLogo } from '../../src/helpers';
import { metamask } from '../test.spec';
import { pause } from '../utils';

export const addNetworkTests = async (): Promise<void> => {
  after(async () => {
    await metamask.switchNetwork('local');
    await metamask.deleteNetwork('Avalanche Network');
    await pause(0.5);
  });

  it('should add network with required params', async () => {
    await metamask.addNetwork({
      networkName: 'Avalanche Network',
      rpc: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114,
      symbol: 'AVAX',
    });

    const selectedNetwork = await metamask.page.evaluate(
      () => (document.querySelector('.network-display > span:nth-child(2)') as HTMLSpanElement).innerHTML,
    );
    expect(selectedNetwork).to.be.equal('Avalanche Network');
  });

  it('should fail to add already added network', async () => {
    await expect(
      metamask.addNetwork({
        networkName: 'Avalanche Network',
        rpc: 'https://api.avax.network/ext/bc/C/rpc',
        chainId: 43114,
        symbol: 'AVAX',
      }),
    ).to.be.rejectedWith(SyntaxError);

    await clickOnLogo(metamask.page);
  });

  // it('should fail to add network with wrong chain ID', async () => {
  //   await expect(
  //     metamask.addNetwork({
  //       networkName: 'Optimistic Ethereum Testnet Kovan',
  //       rpc: 'https://kovan.optimism.io/',
  //       chainId: 99999,
  //       symbol: 'KUR',
  //     }),
  //   ).to.be.rejectedWith(SyntaxError);

  //   await clickOnLogo(metamask.page);
  // });
};
