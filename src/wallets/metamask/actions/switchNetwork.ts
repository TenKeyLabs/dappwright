import { Page } from 'playwright-core';
import { openNetworkDropdown } from './helpers';

export const switchNetwork =
  (page: Page) =>
  async (network = 'main'): Promise<void> => {
    await page.bringToFront();
    await openNetworkDropdown(page);
    await page.waitForSelector(':nth-match(li.dropdown-menu-item, 2)');

    const networkIndex = await page.evaluate((network) => {
      const elements = document.querySelectorAll('li.dropdown-menu-item');
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if ((element as HTMLLIElement).innerText.toLowerCase().includes(network.toLowerCase())) {
          return i;
        }
      }
      return 0;
    }, network);

    const networkFullName = await page.evaluate((index) => {
      const elements = document.querySelectorAll(`li.dropdown-menu-item > span`);
      return (elements[index] as HTMLLIElement).innerText;
    }, networkIndex);

    const networkButton = (await page.$$('li.dropdown-menu-item'))[networkIndex];
    await networkButton.click();

    await page.waitForSelector(`//*[text() = '${networkFullName}']`);
  };
