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
