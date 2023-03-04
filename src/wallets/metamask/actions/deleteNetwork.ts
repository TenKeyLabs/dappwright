import { Page } from 'playwright-core';
import { clickOnButton, getElementByContent, waitForChromeState } from '../../../helpers';
import { clickOnLogo, openNetworkDropdown } from './helpers';

export const deleteNetwork =
  (page: Page) =>
  async (name: string): Promise<void> => {
    await page.bringToFront();

    await openNetworkDropdown(page);
    const network = await getElementByContent(page, name);
    await network.hover();

    const deleteButton = await page.waitForSelector(`//*[contains(text(), '${name}')]/following-sibling::i`);
    await deleteButton.click();

    await clickOnButton(page, 'Delete');
    await clickOnLogo(page);
    await waitForChromeState(page);
  };
