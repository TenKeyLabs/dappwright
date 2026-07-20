import { describe, expect, it, vi } from 'vitest';
import type { Page } from 'playwright-core';

const mocks = vi.hoisted(() => ({
  closePopup: vi.fn(),
  findNetworkListItem: vi.fn(),
  openNetworkDropdown: vi.fn(),
  waitForChromeState: vi.fn(),
}));

vi.mock('../../../helpers', () => ({
  clickOnButton: vi.fn(),
  clickOnElement: vi.fn(),
  performPopupAction: vi.fn(),
  waitForChromeState: mocks.waitForChromeState,
}));

vi.mock('../setup/setupActions', () => ({ closePopup: mocks.closePopup }));

vi.mock('./helpers', () => ({
  findNetworkListItem: mocks.findNetworkListItem,
  getErrorMessage: vi.fn(),
  networkListItem: vi.fn(),
  openNetworkDropdown: mocks.openNetworkDropdown,
  openNetworkSettings: vi.fn(),
}));

import { switchNetwork } from './network';

describe('switchNetwork', () => {
  it('selects the interactive row and closes the retained MetaMask network picker', async () => {
    const item = { click: vi.fn().mockResolvedValue(undefined) };
    const closeButton = {
      isVisible: vi.fn().mockResolvedValue(true),
      click: vi.fn().mockResolvedValue(undefined),
      waitFor: vi.fn().mockResolvedValue(undefined),
    };
    const page = {
      bringToFront: vi.fn().mockResolvedValue(undefined),
      getByTestId: vi.fn().mockReturnValue(closeButton),
    } as unknown as Page;
    mocks.findNetworkListItem.mockResolvedValue(item);

    await switchNetwork(page)('Anvil Local');

    expect(mocks.openNetworkDropdown).toHaveBeenCalledWith(page);
    expect(mocks.findNetworkListItem).toHaveBeenCalledWith(page, 'Anvil Local');
    expect(item.click).toHaveBeenCalledOnce();
    expect(closeButton.click).toHaveBeenCalledOnce();
    expect(closeButton.waitFor).toHaveBeenCalledWith({ state: 'hidden' });
    expect(mocks.waitForChromeState).toHaveBeenCalledWith(page);
  });
});
