import { expect } from '@playwright/test';
import { Dappwright, MetaMaskWallet } from '../src';
import { openAccountMenu } from '../src/wallets/metamask/actions/helpers';
import { forCoinbase, forMetaMask } from './helpers/itForWallet';
import { testWithWallet as test } from './helpers/walletTest';

// TODO: Add this to the wallet interface
const countAccounts = async (wallet: Dappwright): Promise<number> => {
  let count;

  if (wallet instanceof MetaMaskWallet) {
    await openAccountMenu(wallet.page);
    count = (await wallet.page.$$('.multichain-account-list-item')).length;
    await wallet.page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click();
  } else {
    await wallet.page.getByTestId('portfolio-header--switcher-cell-pressable').click();
    count = (await wallet.page.$$('//button[@data-testid="wallet-switcher--wallet-item-cell-pressable"]')).length;
    await wallet.page.getByTestId('portfolio-header--switcher-cell-pressable').click();
  }

  return count;
};

test.describe('when interacting with the wallet', () => {
  test('should lock and unlock', async ({ wallet }) => {
    await wallet.lock();
    await wallet.unlock('password1234!@#$');
  });

  test.describe('account management', () => {
    test.describe('createAccount', () => {
      test('should create a new wallet/account', async ({ wallet }) => {
        const walletCount = await countAccounts(wallet);
        expect(await countAccounts(wallet)).toEqual(walletCount);

        await wallet.createAccount();

        const expectedAccountName = wallet instanceof MetaMaskWallet ? 'Account 2' : 'Wallet 2';
        expect(wallet.page.getByText(expectedAccountName));
        expect(await countAccounts(wallet)).toEqual(walletCount + 1);
      });
    });

    test.describe('switchAccount', () => {
      test('should switch accounts', async ({ wallet }) => {
        await wallet.switchAccount(1);

        const expectedAccountName = wallet instanceof MetaMaskWallet ? 'Account 1' : 'Wallet 1';
        expect(wallet.page.getByText(expectedAccountName));
      });
    });
  });

  test.describe('network configurations', () => {
    const networkOptions = {
      networkName: 'Cronos Mainnet',
      rpc: 'https://evm.cronos.org',
      chainId: 25,
      symbol: 'CRO',
    };

    test.describe('hasNetwork', () => {
      test('should return true if a network has been configured', async ({ wallet }) => {
        expect(await wallet.hasNetwork('Ethereum')).toBeTruthy();
      });

      test('should return false if a network has not been configured', async ({ wallet }) => {
        expect(await wallet.hasNetwork('not there')).toBeFalsy();
      });
    });

    test.describe('addNetwork', () => {
      test('should configure a new network', async ({ wallet }) => {
        await wallet.addNetwork(networkOptions);

        expect(await wallet.hasNetwork(networkOptions.networkName)).toBeTruthy();
      });

      test('should fail if network already exists', async ({ wallet }) => {
        await expect(wallet.addNetwork(networkOptions)).rejects.toThrowError(SyntaxError);
      });
    });

    test.describe('switchNetwork', () => {
      test('should switch network, localhost', async ({ wallet }) => {
        if (wallet instanceof MetaMaskWallet) {
          await wallet.switchNetwork('Sepolia');

          const selectedNetwork = wallet.page.getByTestId('network-display').getByText('Sepolia');
          expect(selectedNetwork).toBeVisible();
        } else {
          console.warn('Coinbase skips network switching');
        }
      });
    });

    test.describe('deleteNetwork', () => {
      test('should delete a network configuration', async ({ wallet }) => {
        await wallet.deleteNetwork(networkOptions.networkName);

        expect(await wallet.hasNetwork(networkOptions.networkName)).toBeFalsy();
      });
    });

    // TODO: Come back to this since metamask doesn't consider this to be an error anymore but blocks
    // test('should fail to add network with wrong chain ID', async ({ wallet }) => {
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
  test.describe('private keys', () => {
    test.describe('importPK', () => {
      test('should import private key', async ({ wallet }) => {
        await forMetaMask(wallet, async () => {
          const beforeImport = await countAccounts(wallet);
          await wallet.importPK('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b10');
          const afterImport = await countAccounts(wallet);

          expect(beforeImport + 1).toEqual(afterImport);
        });
      });

      test('should throw error on duplicated private key', async ({ wallet }) => {
        await forMetaMask(wallet, async () => {
          await expect(
            wallet.importPK('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b10'),
          ).rejects.toThrowError(SyntaxError);
        });
      });

      test('should throw error on wrong key', async ({ wallet }) => {
        await forMetaMask(wallet, async () => {
          await expect(
            wallet.importPK('4f3edf983ac636a65a$@!ce7c78d9aa706d3b113bce9c46f30d7d21715b23b10'),
          ).rejects.toThrowError(SyntaxError);
        });
      });

      test('should throw error on to short key', async ({ wallet }) => {
        await forMetaMask(wallet, async () => {
          await expect(
            wallet.importPK('4f3edf983ac636a65ace7c78d9aa706d3b113bce9c46f30d7d21715b23b10'),
          ).rejects.toThrowError(SyntaxError);
        });
      });
    });

    test.describe('deleteAccount', () => {
      test('should be able to delete an account', async ({ wallet }) => {
        await forMetaMask(wallet, async () => {
          const beforeDelete = await countAccounts(wallet);
          await wallet.deleteAccount(beforeDelete);
          const afterDelete = await countAccounts(wallet);

          expect(beforeDelete - 1).toEqual(afterDelete);
        });
      });
    });
  });

  test.describe('getTokenBalance', () => {
    test.beforeEach(async ({ wallet }) => {
      if (wallet instanceof MetaMaskWallet) await wallet.switchNetwork('GoChain Testnet');
    });

    test('should return token balance', async ({ wallet }) => {
      let tokenBalance: number;

      await forMetaMask(wallet, async () => {
        tokenBalance = await wallet.getTokenBalance('GO');
        expect(tokenBalance).toBeLessThanOrEqual(1000);
        expect(tokenBalance).toBeGreaterThanOrEqual(999.999);
      });

      // Unable to get local balance from Coinbase wallet. This is Sepolia value for now.
      await forCoinbase(wallet, async () => {
        tokenBalance = await wallet.getTokenBalance('ETH');
        // expect(tokenBalance).toEqual(999.999);
      });
    });

    test('should return 0 token balance when token not found', async ({ wallet }) => {
      await expect(wallet.getTokenBalance('TKLBUCKS')).rejects.toThrowError(new Error('Token TKLBUCKS not found'));
    });
  });

  test.describe('when working with tokens', () => {
    test('should add token', async ({ wallet }) => {
      await forMetaMask(wallet, async () => {
        await wallet.addToken({
          tokenAddress: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
          symbol: 'KAKI',
        });
      });
    });
  });
});
