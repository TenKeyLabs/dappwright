import { Browser, Page } from 'playwright';

import { Dappeteer } from '..';

import { addNetwork } from './addNetwork';
import { addToken } from './addToken';
import { approve } from './approve';
import { confirmTransaction } from './confirmTransaction';
import { createAccount } from './createAccount';
import { deleteAccount, deleteNetwork, getTokenBalance } from './helpers';
import { importPk } from './importPk';
import { lock } from './lock';
import { sign } from './sign';
import { switchAccount } from './switchAccount';
import { switchNetwork } from './switchNetwork';
import { unlock } from './unlock';

export const getMetamask = async (page: Page, version?: string): Promise<Dappeteer> => {
  return {
    addNetwork: addNetwork(page, version),
    approve: approve(page, version),
    confirmTransaction: confirmTransaction(page, version),
    createAccount: createAccount(page, version),
    importPK: importPk(page, version),
    lock: lock(page, version),
    sign: sign(page, version),
    switchAccount: switchAccount(page, version),
    switchNetwork: switchNetwork(page, version),
    unlock: unlock(page, version),
    addToken: addToken(page),
    helpers: {
      getTokenBalance: getTokenBalance(page),
      deleteAccount: deleteAccount(page),
      deleteNetwork: deleteNetwork(page),
    },
    page,
  };
};

/**
 * Return MetaMask instance
 * */
export async function getMetamaskWindow(browser: Browser, version?: string): Promise<Dappeteer> {
  const metamaskPage = await new Promise<Page>((resolve) => {
    browser.contexts[0].pages().then((pages) => {
      for (const page of pages) {
        if (page.url().includes('chrome-extension')) resolve(page);
      }
    });
  });

  return getMetamask(metamaskPage, version);
}
