import type { Page } from 'playwright-core';
import { describe, expect, it, vi } from 'vitest';
import { performPopupAction } from './actions';

const EXTENSION = 'chrome-extension://walletid';

type FakePage = Page & { open: (popup: Page) => void; closeNow: () => void };

const walletPage = (): FakePage => {
  const pages: Page[] = [];
  let closed = false;
  const page = {
    url: () => `${EXTENSION}/home.html#/`,
    isClosed: () => closed,
    context: () => ({ pages: () => [page, ...pages] }),
    open: (popup: Page) => pages.push(popup),
    closeNow: () => {
      closed = true;
    },
  } as unknown as FakePage;
  return page;
};

// Closed from the start, so that performPopupAction doesn't go on to wait for it to close
const pageAt = (url: string, isClosed = true): Page =>
  ({ url: () => url, isClosed: () => isClosed }) as unknown as Page;
const openPageAt = (url: string): Page => {
  let closed = false;
  return {
    url: () => url,
    isClosed: () => closed,
    waitForEvent: vi.fn(() => {
      closed = true;
      return Promise.resolve();
    }),
  } as unknown as Page;
};

describe('performPopupAction', () => {
  it('finds a popup that opened before it was called', async () => {
    const wallet = walletPage();
    const popup = openPageAt(`${EXTENSION}/notification.html`);
    wallet.open(popup);
    const action = vi.fn().mockResolvedValue(undefined);

    await performPopupAction(wallet, action);

    expect(action).toHaveBeenCalledWith(popup);
    expect(popup.waitForEvent).toHaveBeenCalledWith('close');
  });

  it('waits for a popup that opens after it was called', async () => {
    const wallet = walletPage();
    const popup = openPageAt(`${EXTENSION}/index.html?action=request`);
    const action = vi.fn().mockResolvedValue(undefined);

    const performed = performPopupAction(wallet, action);
    expect(action).not.toHaveBeenCalled();
    wallet.open(popup);
    await performed;

    expect(action).toHaveBeenCalledWith(popup);
  });

  it('takes the newest popup when another extension page is open', async () => {
    const wallet = walletPage();
    const popup = openPageAt(`${EXTENSION}/notification.html`);
    wallet.open(openPageAt(`${EXTENSION}/sidepanel.html`));
    wallet.open(popup);
    const action = vi.fn().mockResolvedValue(undefined);

    await performPopupAction(wallet, action);

    expect(action).toHaveBeenCalledWith(popup);
  });

  it('ignores the home page, dapps, blank tabs and closed popups', async () => {
    const wallet = walletPage();
    const popup = openPageAt(`${EXTENSION}/notification.html`);
    wallet.open(popup);
    wallet.open(openPageAt(`${EXTENSION}/home.html#/`));
    wallet.open(openPageAt('http://localhost:8080/?a=1'));
    wallet.open(openPageAt('about:blank'));
    wallet.open(pageAt(`${EXTENSION}/notification.html?closed=1`));
    const action = vi.fn().mockResolvedValue(undefined);

    await performPopupAction(wallet, action);

    expect(action).toHaveBeenCalledWith(popup);
  });

  it('stops waiting if the wallet page closes', async () => {
    const wallet = walletPage();
    const action = vi.fn();

    const performed = performPopupAction(wallet, action);
    wallet.closeNow();

    await expect(performed).rejects.toThrowError('wallet page closed');
    expect(action).not.toHaveBeenCalled();
  });
});
