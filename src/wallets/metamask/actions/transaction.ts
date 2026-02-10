import { Page } from 'playwright-core';
import { performPopupAction, waitForChromeState } from '../../../helpers';
import { TransactionOptions } from '../../../types';

export const approve = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await clickConfirm(popup);
    await waitForChromeState(page);
  });
};

export const clickConfirm = async (popup: Page): Promise<void> => {
  await popup.getByTestId('confirm-btn').click();
};

export const reject = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    const cancelButton = popup.getByTestId('confirm-footer-cancel-button');
    const rejectButton = popup.getByTestId('cancel-btn');

    await cancelButton.or(rejectButton).click();
  });
};

export const sign = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await popup.bringToFront();
    await popup.reload();

    await popup.getByTestId('confirm-footer-button').click();
  });
};

export const confirmTransaction =
  (page: Page) =>
  async (options?: TransactionOptions): Promise<void> => {
    await performPopupAction(page, async (popup) => {
      if (options) {
        await popup.getByTestId('edit-gas-fee-icon').click();
        await popup.getByTestId('gas-option-advanced').click();

        if (options.gas) {
          await popup.getByTestId('max-base-fee-input').getByRole('textbox').fill(String(options.gas));
        }

        if (options.priority) {
          await popup.getByTestId('priority-fee-input').getByRole('textbox').fill(String(options.priority));
        }

        if (options.gasLimit) {
          await popup.getByTestId('gas-input').getByRole('textbox').fill(String(options.gasLimit));
        }

        await popup.getByTestId('gas-fee-modal-save-button').click();
      }

      await popup.getByTestId('confirm-footer-button').click();
    });
  };
