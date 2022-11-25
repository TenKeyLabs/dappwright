import { Page } from 'playwright-core';

import { TransactionOptions } from '../../..';
import { clickOnButton, typeOnInputField } from '../../../helpers';
import { performPopupAction } from './util';

const MIN_GAS = 21000;

export const confirmTransaction =
  (page: Page) =>
  async (options?: TransactionOptions): Promise<void> => {
    // await page.bringToFront();
    // await page.waitForTimeout(500);
    // await page.reload();
    performPopupAction(page, async (popup) => {
      if (options) {
        await clickOnButton(popup, 'Edit');
        await clickOnButton(popup, 'Edit suggested gas fee');
        //non EIP1559 networks don't have priority fee. TODO: run separate Ganache with older hardfork to test this
        let priority = false;
        if (options.priority) {
          priority = await typeOnInputField(popup, 'Max priority fee', String(options.priority), true, true, true);
        }
        if (options.gasLimit && options.gasLimit >= MIN_GAS)
          await typeOnInputField(popup, 'Gas Limit', String(options.gasLimit), true);
        if (options.gas && options.gasLimit >= MIN_GAS)
          await typeOnInputField(popup, priority ? 'Max fee' : 'Gas Limit', String(options.gasLimit), true);

        await clickOnButton(popup, 'Save');
      }

      await clickOnButton(popup, 'Confirm');
    });
  };
