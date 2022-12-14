import { readdir } from 'fs/promises';

import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import * as dappwright from '../src/index';
import { Dappwright } from '../src/index';

import { BrowserContext, Page } from 'playwright-core';
import { MetaMaskWallet } from '../src/wallets/metamask/metamask';
import { defaultDirectory } from '../src/wallets/metamask/setup/downloader';
import deploy from './deploy';
import { pause } from './utils';
import { addNetworkTests } from './utils/addNetwork';
import { importPKTests } from './utils/importPK';

chaiUse(chaiAsPromised);

async function clickElement(page, selector): Promise<void> {
  await page.bringToFront();
  await page.waitForSelector(selector);
  const element = await page.$(selector);
  await element.click();
}

export let testContract, browserContext: BrowserContext, metamask: Dappwright, testPage: Page;

describe('dappwright', () => {
  before(async () => {
    testContract = await deploy();
    [metamask, testPage, browserContext] = await dappwright.bootstrap('', {
      wallet: 'metamask',
      version: process.env.METAMASK_VERSION || MetaMaskWallet.recommendedVersion,
      seed: 'pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog',
      password: 'password1234',
    });

    testPage = await browserContext.newPage();
    await testPage.goto('http://localhost:8080/');

    // output version
    const directory = defaultDirectory;
    const files = await readdir(directory);
    console.log(`::set-output name=version::${files.pop().replace(/_/g, '.')}`);
  });

  // validate dappateer setup
  it('should be deployed, contract', async () => {
    expect(testContract).to.be.ok;
    expect(testContract.address).to.be.ok;
    expect(testContract.options.address).to.be.ok;
  });

  it('should running, playwright', async () => {
    expect(browserContext).to.be.ok;
  });

  it('should open, metamask', async () => {
    expect(metamask).to.be.ok;
  });

  it('should open, test page', async () => {
    expect(testPage).to.be.ok;
    expect(await testPage.title()).to.be.equal('Local metamask test');
  });

  describe('test addNetwork method', addNetworkTests.bind(this));
  describe('test importPK method', importPKTests.bind(this));

  // TODO: add more cases
  it('should switch network, localhost', async () => {
    await metamask.switchNetwork('localhost');

    const selectedNetwork = await metamask.page.evaluate(
      () => (document.querySelector('.network-display > span:nth-child(2)') as HTMLSpanElement).innerHTML,
    );
    expect(selectedNetwork).to.be.equal('Localhost 8545');
  });

  describe('test switchAccount method', async () => {
    before(async () => {
      await metamask.importPK('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b10');
    });

    after(async () => {
      await metamask.deleteAccount(2);
      await pause(0.5);
    });

    it('should switch accounts', async () => {
      await metamask.switchAccount(1);
    });
  });

  // TODO: cover more cases
  it('should add token', async () => {
    await metamask.switchNetwork('kovan');
    await metamask.addToken({
      tokenAddress: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
      symbol: 'KAKI',
    });
    await metamask.switchNetwork('localhost');
  });

  it('should lock and unlock', async () => {
    await metamask.lock();
    await metamask.unlock('password1234');
  });

  it('should connect to ethereum', async () => {
    await clickElement(testPage, '.connect-button');
    await metamask.approve();

    // For some reason initial approve does not resolve nor fail promise
    await testPage.waitForSelector('#connected', { state: 'hidden' });
  });

  it('should be able to sign', async () => {
    await clickElement(testPage, '.sign-button');
    await metamask.sign();

    await testPage.waitForSelector('#signed', { state: 'hidden' });
  });

  it('should return token balance', async () => {
    const tokenBalance: number = await metamask.getTokenBalance('ETH');
    expect(tokenBalance).to.be.greaterThan(0);
  });

  it('should return 0 token balance when token not found', async () => {
    const tokenBalance: number = await metamask.getTokenBalance('FARTBUCKS');
    expect(tokenBalance).to.be.equal(0);
  });

  // describe('test contract', async () => {
  //   let counterBefore;

  //   before(async () => {
  //     await metamask.switchNetwork('local');
  //     counterBefore = await getCounterNumber(testContract);
  //   });

  //   it('should confirm transaction', async () => {
  //     // click increase button
  //     await testPage.pause();
  //     await clickElement(testPage, '.increase-button');

  //     // submit tx
  //     await metamask.confirmTransaction();
  //     await testPage.waitForSelector('#txSent', { state: 'hidden' });
  //   });

  //   it('should have increased count', async () => {
  //     // wait half a seconds just in case
  //     await pause(1);

  //     const counterAfter = await getCounterNumber(testContract);
  //     console.log(counterAfter);
  //     await testPage.pause();

  //     expect(counterAfter).to.be.equal(counterBefore + 1);
  //   });
  // });

  describe('test confirmTransaction method', async () => {
    it('should change gas values', async () => {
      // click increase button
      await clickElement(testPage, '.increase-fees-button');

      // submit tx
      await metamask.confirmTransaction({
        gas: 21000,
        gasLimit: 400000,
      });
      await testPage.waitForSelector('#feesTxSent', { state: 'hidden' });
    });

    it('should not fail if gas priority is missing', async () => {
      await metamask.switchNetwork('localhost');

      // click increase button
      await clickElement(testPage, '.transfer-button');
      await pause(1);

      // submit tx
      await metamask.confirmTransaction({
        gas: 21000,
        priority: 2,
        gasLimit: 202020,
      });

      await pause(5);
      await testPage.waitForSelector('#transferred', { state: 'hidden' });
    });
  });
});
