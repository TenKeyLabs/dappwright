import { Page } from 'playwright-core';
import { clickOnButton, typeOnInputField } from '../../../helpers';
import { closePopup } from '../setup/setupActions';

export const unlock =
  (page: Page) =>
  async (password = 'password1234'): Promise<void> => {
    await page.bringToFront();

    await typeOnInputField(page, 'Password', password);
    await clickOnButton(page, 'Unlock');
    await closePopup(page);
  };
