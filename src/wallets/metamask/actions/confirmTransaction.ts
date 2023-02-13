import { Page } from 'playwright-core';

import { TransactionOptions } from '../../..';
import { performPopupAction } from './util';

export const confirmTransaction =
  (page: Page) =>
  async (options?: TransactionOptions): Promise<void> => {
    await performPopupAction(page, async (popup) => {
      if (options) {
        await popup.getByTestId('edit-gas-fee-button').click();
        await popup.getByTestId('edit-gas-fee-item-custom').click();

        if (options.gas) {
          await popup.getByTestId('base-fee-input').fill(String(options.gas));
        }

        if (options.priority) {
          await popup.getByTestId('priority-fee-input').fill(String(options.priority));
        }

        if (options.gasLimit) {
          await popup.getByTestId('advanced-gas-fee-edit').click();
          await popup.getByTestId('gas-limit-input').fill(String(options.gasLimit));
        }

        await popup.getByRole('button', { name: 'Save' }).click();
      }

      await popup.getByTestId('page-container-footer-next').click();
    });
  };
