import { Page } from 'playwright-core';

import { clickOnButton, waitForChromeState } from '../../../helpers';
import { connect } from './approve';
import { performPopupAction } from './util';

export const signin = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await popup.waitForSelector('#app-content .app');

    const signatureTextVisible = await popup.getByText('Signature request').isVisible();
    if (!signatureTextVisible) {
      await connect(popup);
    }

    await clickOnButton(popup, 'Sign-In');
    await waitForChromeState(page);
  });
};
