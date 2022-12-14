import NodeEnvironment from 'jest-environment-node';
import { chromium } from 'playwright-core';

import { getMetamaskWindow } from '../../src/index';

class DappwrightEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup(): Promise<void> {
    await super.setup();

    // get the wsEndpoint
    const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
    if (!wsEndpoint) {
      throw new Error('wsEndpoint not found');
    }

    // connect to playwright
    const browser = await chromium.connect({
      wsEndpoint: wsEndpoint,
    });
    this.global.browser = browser;
    this.global.metamask = await getMetamaskWindow(browser);
    this.global.page = await browser.newPage();
  }
}

module.exports = DappwrightEnvironment;
