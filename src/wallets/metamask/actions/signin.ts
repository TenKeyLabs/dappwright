import { Page } from 'playwright-core';

import { waitForChromeState } from '../../../helpers';
import { connect } from './approve';
import { performPopupAction } from './util';

export const signin = (page: Page) => async (): Promise<void> => {
  await performPopupAction(page, async (popup) => {
    await popup.waitForSelector('#app-content .app');

    const [signatureTextVisible, signinTextVisible] = await Promise.all([
      popup.getByText('Signature request').isVisible(),
      popup.getByText('Sign-in request').isVisible(),
    ]);

    if (!signatureTextVisible && !signinTextVisible) {
      await connect(popup);
    }

    const signInButton = popup.getByTestId('confirm-footer-button');
    await signInButton.scrollIntoViewIfNeeded();
    await signInButton.click();

    await waitForChromeState(page);
  });
};
