import { Page } from 'playwright';

import { clickOnButton, typeOnInputField } from '../helpers';
import { closePopup } from '../setup/setupActions';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const unlock = (page: Page, version?: string) => async (password = 'password1234'): Promise<void> => {
  await page.bringToFront();

  await typeOnInputField(page, 'Password', password);
  await clickOnButton(page, 'Unlock');
  await closePopup(page);
};
