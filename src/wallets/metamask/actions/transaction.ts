import { Page } from 'playwright-core';
import { performSidepanelAction, waitForChromeState } from '../../../helpers';
import { TransactionOptions } from '../../../types';

export const approve = (page: Page) => async (): Promise<void> => {
  await performSidepanelAction(page, async (sidepanel) => {
    await clickConfirm(sidepanel);
    await waitForChromeState(page);
  });
};

export const clickConfirm = async (popup: Page): Promise<void> => {
  await popup.getByTestId('confirm-btn').click();
};

export const reject = (page: Page) => async (): Promise<void> => {
  await performSidepanelAction(page, async (sidepanel) => {
    const cancelButton = sidepanel.getByTestId('confirm-footer-cancel-button');
    const rejectButton = sidepanel.getByTestId('cancel-btn');

    await cancelButton.or(rejectButton).click();
  });
};

export const sign = (page: Page) => async (): Promise<void> => {
  await performSidepanelAction(page, async (sidepanel) => {
    await sidepanel.bringToFront();
    await sidepanel.reload();

    await sidepanel.getByTestId('confirm-footer-button').click();
  });
};

export const confirmTransaction =
  (page: Page) =>
  async (options?: TransactionOptions): Promise<void> => {
    await performSidepanelAction(page, async (sidepanel) => {
      if (options) {
        await sidepanel.getByTestId('edit-gas-fee-icon').click();
        await sidepanel.getByTestId('edit-gas-fee-item-custom').click();

        if (options.gas) {
          await sidepanel.getByTestId('base-fee-input').fill(String(options.gas));
        }

        if (options.priority) {
          await sidepanel.getByTestId('priority-fee-input').fill(String(options.priority));
        }

        if (options.gasLimit) {
          await sidepanel.getByTestId('advanced-gas-fee-edit').click();
          await sidepanel.getByTestId('gas-limit-input').fill(String(options.gasLimit));
        }

        await sidepanel.getByRole('button', { name: 'Save' }).click();
      }

      await sidepanel.getByTestId('confirm-footer-button').click();
    });
  };
