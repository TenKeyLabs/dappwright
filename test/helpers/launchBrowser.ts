import { BrowserContext, Page } from 'playwright-core';
import * as dappwright from '../../src/index';
import { Dappwright, OfficialOptions } from '../../src/index';

export default async (options: OfficialOptions): Promise<[BrowserContext, Page, Dappwright]> => {
  const { browserContext, wallet } = await dappwright.launch('', options);
  await wallet.unlock('password1234!@#$');

  const testPage = await browserContext.newPage();
  await testPage.goto('http://localhost:8080/');

  return [browserContext, testPage, wallet];
};
