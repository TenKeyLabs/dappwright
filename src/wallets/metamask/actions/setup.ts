import { Page } from 'playwright-core';
import { performSidepanelAction, waitForChromeState } from '../../../helpers';
import { closePopup } from '../setup/setupActions';
import { openAccountOptionsMenu } from './helpers';
import { clickConfirm } from './transaction';

export const lock = (page: Page) => async (): Promise<void> => {
  await page.bringToFront();

  await openAccountOptionsMenu(page);
  await page.getByTestId('global-menu-lock').click();
};

export const unlock =
  (page: Page) =>
  async (password = 'password1234'): Promise<void> => {
    await page.bringToFront();

    await page.getByTestId('unlock-password').fill(password);
    await page.getByTestId('unlock-submit').click();

    await closePopup(page);
  };

export const signin = (page: Page) => async (): Promise<void> => {
  await performSidepanelAction(page, async (sidepanel) => {
    await sidepanel.waitForURL(/(connect)|(signature-request)/);

    const signinTextVisible = await sidepanel.getByText(/Connect this website/).isVisible();
    if (signinTextVisible) {
      await clickConfirm(sidepanel);
    }

    const signInButton = sidepanel.getByTestId('confirm-footer-button');
    await signInButton.scrollIntoViewIfNeeded();
    await signInButton.click();

    await waitForChromeState(page);
  });
};
