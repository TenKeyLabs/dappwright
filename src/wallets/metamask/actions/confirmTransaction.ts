import { Page } from 'playwright-core';

import { TransactionOptions } from '../../..';
import { clickOnButton, typeOnInputField } from '../../../helpers';
import { performPopupAction } from './util';

const MIN_GAS = 21000;

export const confirmTransaction =
  (page: Page) =>
  async (options?: TransactionOptions): Promise<void> => {
    await performPopupAction(page, async (popup) => {
      if (options) {
        await clickOnButton(popup, 'Edit');
        await clickOnButton(popup, 'Advanced options');
        //non EIP1559 networks don't have priority fee. TODO: run separate Ganache with older hardfork to test this
        let priority = options.priority || false;
        if (priority) {
          priority = await typeOnInputField(popup, 'Max priority fee', String(options.priority), true, true, true);
        }
        if (options.gasLimit && options.gasLimit >= MIN_GAS)
          await typeOnInputField(popup, 'Gas limit', String(options.gasLimit), true);
        if (options.gas && options.gasLimit >= MIN_GAS) {
          const label = priority ? 'Max fee' : 'Gas limit';
          await typeOnInputField(popup, label, String(options.gasLimit), true, true, true);
        }

        await clickOnButton(popup, 'Save');
      }

      await clickOnButton(popup, 'Confirm');
    });
  };
