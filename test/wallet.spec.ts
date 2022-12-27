import { BrowserContext } from 'playwright-core';
import { Dappwright } from '../src';
import { clickOnLogo, openProfileDropdown } from '../src/wallets/metamask/actions/helpers';
import launchBrowser from './helpers/launchBrowser';

describe('when interacting with the wallet', () => {
  let browserContext: BrowserContext, wallet: Dappwright, _;

  beforeAll(async () => {
    [browserContext, _, wallet] = await launchBrowser();
  });

  afterAll(async () => {
    await browserContext.close();
  });

  it('should lock and unlock', async () => {
    await wallet.lock();
    await wallet.unlock('password1234');
  });

  describe('when adding a network', () => {
    afterAll(async () => {
      await wallet.switchNetwork('local');
      await wallet.deleteNetwork('Avalanche Network');
    });

    it('should switch network, localhost', async () => {
      await wallet.switchNetwork('localhost');

      const selectedNetwork = await wallet.page.evaluate(
        () => (document.querySelector('.network-display > span:nth-child(2)') as HTMLSpanElement).innerHTML,
      );

      expect(selectedNetwork).toEqual('Localhost 8545');
    });

    it('should add network with required params', async () => {
      await wallet.addNetwork({
        networkName: 'Avalanche Network',
        rpc: 'https://api.avax.network/ext/bc/C/rpc',
        chainId: 43114,
        symbol: 'AVAX',
      });

      const selectedNetwork = await wallet.page.evaluate(
        () => (document.querySelector('.network-display > span:nth-child(2)') as HTMLSpanElement).innerHTML,
      );
      expect(selectedNetwork).toEqual('Avalanche Network');
    });

    it('should fail to add already added network', async () => {
      await expect(
        wallet.addNetwork({
          networkName: 'Avalanche Network',
          rpc: 'https://api.avax.network/ext/bc/C/rpc',
          chainId: 43114,
          symbol: 'AVAX',
        }),
      ).rejects.toThrowError(SyntaxError);

      await clickOnLogo(wallet.page);
    });

    // TODO: Come back to this since metamask doesn't consider this to be an error anymore but blocks
    // it('should fail to add network with wrong chain ID', async () => {
    //   await expect(
    //     metamask.addNetwork({
    //       networkName: 'Optimistic Ethereum Testnet Kovan',
    //       rpc: 'https://kovan.optimism.io/',
    //       chainId: 99999,
    //       symbol: 'KUR',
    //     }),
    //   ).rejects.toThrowError(SyntaxError);
    //   await metamask.page.pause();
    // });
  });

  describe('when importing a private key', () => {
    const countAccounts = async (): Promise<number> => {
      await openProfileDropdown(wallet.page);
      const container = await wallet.page.$('.account-menu__accounts');
      const count = (await container.$$('.account-menu__account')).length;
      await openProfileDropdown(wallet.page);
      return count;
    };

    beforeEach(async () => {
      await clickOnLogo(wallet.page);
    });

    it('should import private key', async () => {
      const beforeImport = await countAccounts();
      await wallet.importPK('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b10');
      const afterImport = await countAccounts();

      expect(beforeImport + 1).toEqual(afterImport);
    });

    it('should switch accounts', async () => {
      await wallet.switchAccount(1);
      expect(wallet.page.getByText('Account 2'));
    });

    it('should throw error on duplicated private key', async () => {
      await expect(
        wallet.importPK('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b10'),
      ).rejects.toThrowError(SyntaxError);
    });

    it('should throw error on wrong key', async () => {
      await expect(
        wallet.importPK('4f3edf983ac636a65a$@!ce7c78d9aa706d3b113bce9c46f30d7d21715b23b10'),
      ).rejects.toThrowError(SyntaxError);
    });

    it('should throw error on to short key', async () => {
      await expect(
        wallet.importPK('4f3edf983ac636a65ace7c78d9aa706d3b113bce9c46f30d7d21715b23b10'),
      ).rejects.toThrowError(SyntaxError);
    });

    it('should be able to delete an account', async () => {
      const beforeDelete = await countAccounts();
      await wallet.deleteAccount(2);
      const afterDelete = await countAccounts();

      expect(beforeDelete - 1).toEqual(afterDelete);
    });
  });

  it('should return token balance', async () => {
    const tokenBalance: number = await wallet.getTokenBalance('ETH');
    expect(tokenBalance).toEqual(999.9998);
  });

  it('should return 0 token balance when token not found', async () => {
    const tokenBalance: number = await wallet.getTokenBalance('TKLBUCKS');
    expect(tokenBalance).toEqual(0);
  });

  describe('when working with tokens', () => {
    it('should add token', async () => {
      await wallet.switchNetwork('kovan');
      await wallet.addToken({
        tokenAddress: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
        symbol: 'KAKI',
      });
      await wallet.switchNetwork('localhost');
    });
  });
});
