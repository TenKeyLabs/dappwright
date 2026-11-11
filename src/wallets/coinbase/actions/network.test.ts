import { describe, expect, it, vi } from 'vitest';
import type { Page } from 'playwright-core';

import { deleteNetwork } from './network';

type Mocked = { click: ReturnType<typeof vi.fn>; waitFor?: ReturnType<typeof vi.fn>; fill?: ReturnType<typeof vi.fn> };

const setup = (removeClosesForm: boolean[]): { page: Page; remove: Mocked; other: Mocked } => {
  const remove = {
    click: vi.fn().mockResolvedValue(undefined),
    waitFor: vi.fn(),
  };
  for (const closes of removeClosesForm) {
    if (closes) remove.waitFor.mockResolvedValueOnce(undefined);
    else remove.waitFor.mockRejectedValueOnce(new Error('timeout'));
  }

  const other = { click: vi.fn().mockResolvedValue(undefined), fill: vi.fn().mockResolvedValue(undefined) };
  const row = { click: vi.fn().mockResolvedValue(undefined) };
  const page = {
    getByTestId: vi.fn((id: string) => (id === 'custom-network-delete' ? remove : other)),
    waitForSelector: vi.fn().mockResolvedValue(row),
  } as unknown as Page;

  return { page, remove, other };
};

describe('deleteNetwork', () => {
  it('presses remove once when the form closes', async () => {
    const { page, remove, other } = setup([true]);

    await deleteNetwork(page)('Cronos Mainnet');

    expect(other.fill).toHaveBeenCalledWith('Cronos Mainnet');
    expect(remove.click).toHaveBeenCalledOnce();
    expect(remove.waitFor).toHaveBeenCalledWith({ state: 'hidden', timeout: 2000 });
    expect(page.getByTestId).toHaveBeenLastCalledWith('portfolio-navigation-link');
  });

  it('presses remove again when a press lands while the form is still sliding in', async () => {
    const { page, remove } = setup([false, true]);

    await deleteNetwork(page)('Cronos Mainnet');

    expect(remove.click).toHaveBeenCalledTimes(2);
    expect(page.getByTestId).toHaveBeenLastCalledWith('portfolio-navigation-link');
  });

  it('gives up after three presses that do not close the form', async () => {
    const { page, remove } = setup([false, false, false]);

    await expect(deleteNetwork(page)('Cronos Mainnet')).rejects.toThrow(
      'Coinbase did not remove the network "Cronos Mainnet"',
    );
    expect(remove.click).toHaveBeenCalledTimes(3);
    expect(page.getByTestId).not.toHaveBeenCalledWith('portfolio-navigation-link');
  });
});
