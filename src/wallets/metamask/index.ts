import { Page } from 'playwright-core';
import Wallet from '../wallet';
import { addNetwork } from './actions/addNetwork';
import { addToken } from './actions/addToken';
import { approve } from './actions/approve';
import { confirmTransaction } from './actions/confirmTransaction';
import { createAccount } from './actions/createAccount';
import { deleteAccount, deleteNetwork, getTokenBalance } from './actions/helpers';
import { importPk } from './actions/importPk';
import { lock } from './actions/lock';
import { sign } from './actions/sign';
import { switchAccount } from './actions/switchAccount';
import { switchNetwork } from './actions/switchNetwork';
import { unlock } from './actions/unlock';
import downloader from './setup/downloader';

export type MetaMaskOptions = {
  seed?: string;
  password?: string;
  showTestNets?: boolean;
};

export class MetaMask extends Wallet {
  name = 'metamask';
  static recommendedVersion = 'v10.20.0';

  options: MetaMaskOptions;

  constructor(page: Page, version?: string) {
    super(page, version);
  }

  addNetwork = addNetwork(this.page);
  approve = approve(this.page, this.version);
  confirmTransaction = confirmTransaction(this.page);
  createAccount = createAccount(this.page, this.version);
  importPK = importPk(this.page);
  lock = lock(this.page, this.version);
  sign = sign(this.page, this.version);
  switchAccount = switchAccount(this.page);
  switchNetwork = switchNetwork(this.page);
  unlock = unlock(this.page);
  addToken = addToken(this.page);
  deleteAccount = deleteAccount(this.page, this.version);
  deleteNetwork = deleteNetwork(this.page);
  getTokenBalance = getTokenBalance(this.page);

  static download = downloader(this.recommendedVersion);
}
// export const getMetmask = async (page: Page, version?: string): Promise<Dappwright> => {
//   return {
//     addNetwork: addNetwork(page, version),
//     approve: approve(page, version),
//     confirmTransaction: confirmTransaction(page, version),
//     createAccount: createAccount(page, version),
//     importPK: importPk(page, version),
//     lock: lock(page, version),
//     sign: sign(page, version),
//     switchAccount: switchAccount(page, version),
//     switchNetwork: switchNetwork(page, version),
//     unlock: unlock(page, version),
//     addToken: addToken(page),
//     helpers: {
//       getTokenBalance: getTokenBalance(page),
//       deleteAccount: deleteAccount(page),
//       deleteNetwork: deleteNetwork(page),
//     },
//     page,
//   };
// };

/**
 * Return MetaMask instance
 * */
// export async function getExtensionWindow(browser: Browser, version?: string): Promise<Dappwright> {
//   const extensionPage = await new Promise<Page>((resolve) => {
//     browser.contexts[0].pages().then((pages) => {
//       for (const page of pages) {
//         if (page.url().includes('chrome-extension')) resolve(page);
//       }
//     });
//   });

//   return getMetamask(extensionPage, version);
// }
