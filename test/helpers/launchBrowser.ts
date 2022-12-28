import { BrowserContext, Page } from 'playwright-core';
import * as dappwright from '../../src/index';
import { Dappwright } from '../../src/index';

export default async (): Promise<[BrowserContext, Page, Dappwright]> => {
  const { browserContext, wallet } = await dappwright.launch('', {
    wallet: 'metamask',
    version: '10.20.0',
  });
  await wallet.unlock('password1234');

  const testPage = await browserContext.newPage();
  await testPage.goto('http://localhost:8080/');

  return [browserContext, testPage, wallet];
};
