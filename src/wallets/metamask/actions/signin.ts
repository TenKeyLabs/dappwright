import { Page } from 'playwright-core';

import { waitForChromeState } from '../../../helpers';
import { clickConfirm } from './approve';
import { performSidepanelAction } from './util';

export const signin = (page: Page) => async (): Promise<void> => {
  await performSidepanelAction(page, async (popup) => {
    await popup.waitForURL(/(connect)|(signature-request)/);

    const signinTextVisible = await popup.getByText(/Connect this website/).isVisible();
    if (signinTextVisible) {
      await clickConfirm(popup);
    }

    const signInButton = popup.getByTestId('confirm-footer-button');
    await signInButton.scrollIntoViewIfNeeded();
    await signInButton.click();

    await waitForChromeState(page);
  });
};
