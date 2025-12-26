import { Page } from 'playwright-core';
import { TransactionOptions } from '../../../types';
import { performSidepanelAction } from './util';

export const confirmTransaction =
  (page: Page) =>
  async (options?: TransactionOptions): Promise<void> => {
    await performSidepanelAction(page, async (popup) => {
      if (options) {
        await popup.getByTestId('edit-gas-fee-icon').click();
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

      await popup.getByTestId('confirm-footer-button').click();
    });
  };
