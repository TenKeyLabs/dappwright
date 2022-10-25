import { ElementHandle, Page } from 'playwright-core';

// TODO: change text() with '.';
export const getElementByContent = (page: Page, text: string, type = '*'): Promise<ElementHandle | null> =>
  page.waitForSelector(`//${type}[contains(text(), '${text}')]`);

export const getInputByLabel = (
  page: Page,
  text: string,
  excludeSpan = false,
  timeout = 2000,
): Promise<ElementHandle> =>
  page.waitForSelector(
    [
      `//label[contains(.,'${text}')]/following-sibling::textarea`,
      `//label[contains(.,'${text}')]/following-sibling::*//input`,
      `//h6[contains(.,'${text}')]/parent::node()/parent::node()/following-sibling::input`,
      `//h6[contains(.,'${text}')]/parent::node()/parent::node()/following-sibling::*//input`,
      ...(!excludeSpan
        ? [
            `//span[contains(.,'${text}')]/parent::node()/parent::node()/following-sibling::*//input`,
            `//span[contains(.,'${text}')]/following-sibling::*//input`,
          ]
        : []),
    ].join('|'),
    { timeout },
  );

export const getInputByLabelSelector = (text: string, excludeSpan = false): string =>
  [
    `//label[contains(.,'${text}')]/following-sibling::textarea`,
    `//label[contains(.,'${text}')]/following-sibling::*//input`,
    `//h6[contains(.,'${text}')]/parent::node()/parent::node()/following-sibling::input`,
    `//h6[contains(.,'${text}')]/parent::node()/parent::node()/following-sibling::*//input`,
    ...(!excludeSpan
      ? [
          `//span[contains(.,'${text}')]/parent::node()/parent::node()/following-sibling::*//input`,
          `//span[contains(.,'${text}')]/following-sibling::*//input`,
        ]
      : []),
  ].join('|');

export const getSettingsSwitch = (page: Page, text: string): Promise<ElementHandle | null> =>
  page.waitForSelector(
    [
      `//span[contains(.,'${text}')]/parent::div/following-sibling::div/div/div/div`,
      `//span[contains(.,'${text}')]/parent::div/following-sibling::div/div/label/div`,
    ].join('|'),
  );

export const getErrorMessage = async (page: Page): Promise<string | false> => {
  const options: Parameters<Page['waitForSelector']>[1] = { timeout: 1000 };

  const errorElement = await Promise.race([
    page.waitForSelector(`span.error`, options),
    page.waitForSelector(`.typography--color-error-1`, options),
    page.waitForSelector(`.typography--color-error-default`, options),
    // page.waitForSelector(`.form-field__input--warning`, options),
    page.waitForSelector(`.form-field__input--error`, options),
  ]).catch(() => null);
  if (!errorElement) return false;
  return (errorElement as HTMLElement).innerText;
};

export const getAccountMenuButton = (page: Page): Promise<ElementHandle | null> =>
  page.waitForSelector(`button.menu-bar__account-options`);
