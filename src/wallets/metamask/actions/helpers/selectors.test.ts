import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import type { Locator, Page } from 'playwright-core';
import { findNetworkListItem } from './selectors';

describe('findNetworkListItem', () => {
  let item: { waitFor: Mock };
  let rows: { filter: Mock };
  let picker: { waitFor: Mock; getByTestId: Mock };
  let page: Page;

  beforeEach(() => {
    item = { waitFor: vi.fn().mockResolvedValue(undefined) };
    rows = { filter: vi.fn().mockReturnValue({ first: vi.fn().mockReturnValue(item) }) };
    picker = {
      waitFor: vi.fn().mockResolvedValue(undefined),
      getByTestId: vi.fn().mockReturnValue(rows),
    };
    const dialogs = { filter: vi.fn().mockReturnValue(picker) };
    page = {
      getByRole: vi.fn().mockImplementation((role: string) => (role === 'dialog' ? dialogs : 'heading')),
      getByText: vi.fn().mockReturnValue('label'),
    } as unknown as Page;
  });

  it('returns the network picker row with the exact network name', async () => {
    const result = await findNetworkListItem(page, 'Anvil Local');

    expect(result).toBe(item as unknown as Locator);
    expect(page.getByRole).toHaveBeenCalledWith('heading', { name: 'Select network', exact: true });
    const rowTestId = picker.getByTestId.mock.calls[0][0] as RegExp;
    expect(rowTestId.test('home-network-filter-custom-0x7a69')).toBe(true);
    expect(rowTestId.test('home-network-filter-test-0xaa36a7')).toBe(true);
    expect(rowTestId.test('home-network-filter-modal')).toBe(false);
    expect(page.getByText).toHaveBeenCalledWith('Anvil Local', { exact: true });
    expect(rows.filter).toHaveBeenCalledWith({ has: 'label' });
  });

  it('throws when the network is not listed', async () => {
    item.waitFor.mockRejectedValue(new Error('timeout'));

    await expect(findNetworkListItem(page, 'Missing')).rejects.toThrow(
      'MetaMask network "Missing" was not found in the network picker',
    );
  });
});
