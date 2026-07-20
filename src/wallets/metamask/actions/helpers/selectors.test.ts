import { describe, expect, it, vi } from 'vitest';
import type { Locator, Page } from 'playwright-core';
import { findNetworkListItem } from './selectors';

describe('findNetworkListItem', () => {
  it('returns the clickable row inside the Select network dialog, not its text label', async () => {
    const row = { count: vi.fn().mockResolvedValue(1) };
    const label = {
      isVisible: vi.fn().mockResolvedValue(true),
      locator: vi.fn().mockReturnValue(row),
    };
    const labels = {
      first: vi.fn().mockReturnValue({ waitFor: vi.fn().mockResolvedValue(undefined) }),
      count: vi.fn().mockResolvedValue(1),
      nth: vi.fn().mockReturnValue(label),
    };
    const popularTab = {
      getAttribute: vi.fn().mockResolvedValue('true'),
      click: vi.fn(),
    };
    const picker = {
      waitFor: vi.fn().mockResolvedValue(undefined),
      getByText: vi.fn().mockReturnValue(labels),
      getByRole: vi.fn().mockReturnValue(popularTab),
    };
    const dialogs = {
      filter: vi.fn().mockReturnThis(),
      last: vi.fn().mockReturnValue(picker),
    };
    const page = {
      getByRole: vi.fn().mockReturnValue(dialogs),
    } as unknown as Page;

    const result = await findNetworkListItem(page, 'Anvil Local');

    expect(result).toBe(row as unknown as Locator);
    expect(label.locator).toHaveBeenCalledWith('xpath=ancestor::*[starts-with(@data-testid, "network-list-item-")][1]');
    expect(popularTab.click).not.toHaveBeenCalled();
  });
});
