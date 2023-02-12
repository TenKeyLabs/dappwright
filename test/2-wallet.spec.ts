import { BrowserContext } from 'playwright-core';
import { Dappwright, OfficialOptions } from '../src';
import { CoinbaseWallet } from '../src/wallets/coinbase/coinbase';
import { clickOnLogo, openProfileDropdown } from '../src/wallets/metamask/actions/helpers';
import { MetaMaskWallet } from '../src/wallets/metamask/metamask';
import { forCoinbase, forMetaMask } from './helpers/itForWallet';
import launchBrowser from './helpers/launchBrowser';

// TODO: Add this to the wallet interface
const countAccounts = async (wallet: Dappwright): Promise<number> => {
  let count;

  if (wallet instanceof MetaMaskWallet) {
    await openProfileDropdown(wallet.page);
    const container = await wallet.page.$('.account-menu__accounts');
    count = (await container.$$('.account-menu__account')).length;
    await openProfileDropdown(wallet.page);
  } else {
    await wallet.page.getByTestId('portfolio-header--switcher-cell-pressable').click();
    count = (await wallet.page.$$('//button[@data-testid="wallet-switcher--wallet-item-cell-pressable"]')).length;
    await wallet.page.getByTestId('portfolio-header--switcher-cell-pressable').click();
  }

  return count;
};

describe.each<OfficialOptions>([
  {
    wallet: 'coinbase',
    version: CoinbaseWallet.recommendedVersion,
  },
  {
    wallet: 'metamask',
    version: MetaMaskWallet.recommendedVersion,
  },
])('$wallet - when interacting with the wallet', (options: OfficialOptions) => {
  let browserContext: BrowserContext, wallet: Dappwright, _;

  beforeAll(async () => {
    [browserContext, _, wallet] = await launchBrowser(options);
    wallet.page.bringToFront();
  });

  afterAll(async () => {
    await browserContext.close();
  });

  it('should lock and unlock', async () => {
    await wallet.lock();
    await wallet.unlock('password1234!@#$');
  }); // Coinbase wallet unlock waits for homepage to load

  describe('account management', () => {
    describe('createAccount', () => {
      it('should create a new wallet/account', async () => {
        expect(await countAccounts(wallet)).toEqual(1);

        await wallet.createAccount();

        const expectedAccountName = wallet instanceof MetaMaskWallet ? 'Account 2' : 'Wallet 2';
        expect(wallet.page.getByText(expectedAccountName));
        expect(await countAccounts(wallet)).toEqual(2);
      });
    });

    describe('switchAccount', () => {
      it('should switch accounts', async () => {
        await wallet.switchAccount(1);

        const expectedAccountName = wallet instanceof MetaMaskWallet ? 'Account 1' : 'Wallet 1';
        expect(wallet.page.getByText(expectedAccountName));
      });
    });
  });

  describe('network configurations', () => {
    const options = {
      networkName: 'Cronos',
      rpc: 'https://evm.cronos.org',
      chainId: 25,
      symbol: 'CRO',
    };

    describe('hasNetwork', () => {
      it('should return true if a network has been configured', async () => {
        expect(await wallet.hasNetwork('Ethereum')).toBeTruthy();
      });

      it('should return false if a network has not been configured', async () => {
        expect(await wallet.hasNetwork('not there')).toBeFalsy();
      });
    });

    describe('addNetwork', () => {
      it('should configure a new network', async () => {
        await wallet.addNetwork(options);

        expect(await wallet.hasNetwork(options.networkName)).toBeTruthy();
      });

      it('should fail if network already exists', async () => {
        await expect(
          wallet.addNetwork({
            networkName: 'Cronos',
            rpc: 'https://evm.cronos.org',
            chainId: 25,
            symbol: 'CRO',
          }),
        ).rejects.toThrowError(SyntaxError);
      });
    });

    describe('switchNetwork', () => {
      it('should switch network, localhost', async () => {
        if (wallet instanceof MetaMaskWallet) {
          await wallet.switchNetwork('localhost');

          const selectedNetwork = await wallet.page.evaluate(
            () => (document.querySelector('.network-display > span:nth-child(2)') as HTMLSpanElement).innerHTML,
          );
          expect(selectedNetwork).toEqual('Localhost 8545');
        } else {
          console.warn('Coinbase skips network switching');
        }
      });
    });

    describe('deleteNetwork', () => {
      it('should delete a network configuration', async () => {
        await wallet.deleteNetwork(options.networkName);

        expect(await wallet.hasNetwork(options.networkName)).toBeFalsy();
      });
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

  // Metamask only
  describe('private keys', () => {
    beforeEach(async () => {
      await forMetaMask(wallet, async () => {
        await clickOnLogo(wallet.page);
      });
    });

    describe('importPK', () => {
      it('should import private key', async () => {
        await forMetaMask(wallet, async () => {
          const beforeImport = await countAccounts(wallet);
          await wallet.importPK('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b10');
          const afterImport = await countAccounts(wallet);

          expect(beforeImport + 1).toEqual(afterImport);
        });
      });

      it('should throw error on duplicated private key', async () => {
        await forMetaMask(wallet, async () => {
          await expect(
            wallet.importPK('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b10'),
          ).rejects.toThrowError(SyntaxError);
        });
      });

      it('should throw error on wrong key', async () => {
        await forMetaMask(wallet, async () => {
          await expect(
            wallet.importPK('4f3edf983ac636a65a$@!ce7c78d9aa706d3b113bce9c46f30d7d21715b23b10'),
          ).rejects.toThrowError(SyntaxError);
        });
      });

      it('should throw error on to short key', async () => {
        await forMetaMask(wallet, async () => {
          await expect(
            wallet.importPK('4f3edf983ac636a65ace7c78d9aa706d3b113bce9c46f30d7d21715b23b10'),
          ).rejects.toThrowError(SyntaxError);
        });
      });
    });

    describe('deleteAccount', () => {
      it('should be able to delete an account', async () => {
        await forMetaMask(wallet, async () => {
          const beforeDelete = await countAccounts(wallet);
          await wallet.deleteAccount(3);
          const afterDelete = await countAccounts(wallet);

          expect(beforeDelete - 1).toEqual(afterDelete);
        });
      });
    });
  });

  describe('getTokenBalance', () => {
    beforeAll(async () => {
      if (wallet instanceof MetaMaskWallet) await wallet.switchNetwork('localhost');
    });

    it('should return token balance', async () => {
      await forMetaMask(wallet, async () => {
        const tokenBalance: number = await wallet.getTokenBalance('ETH');

        expect(tokenBalance).toEqual(999.9996);
      });

      await forCoinbase(wallet, async () => {
        const tokenBalance: number = await wallet.getTokenBalance('ETH');

        // Unable to get local balance from Coinbase wallet. This is Goerli value for now.
        expect(tokenBalance).toEqual(1000);
      });
    });

    it('should return 0 token balance when token not found', async () => {
      const tokenBalance: number = await wallet.getTokenBalance('TKLBUCKS');
      expect(tokenBalance).toEqual(0);
    });
  });

  describe('when working with tokens', () => {
    it('should add token', async () => {
      await forMetaMask(wallet, async () => {
        await wallet.switchNetwork('kovan');
        await wallet.addToken({
          tokenAddress: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
          symbol: 'KAKI',
        });
        await wallet.switchNetwork('localhost');
      });
    });
  });
});
