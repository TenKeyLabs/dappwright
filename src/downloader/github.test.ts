import { describe, expect, it } from 'vitest';
import { isChromeReleaseAsset } from './github';

describe('isChromeReleaseAsset', () => {
  it('accepts stable chrome zips', () => {
    expect(isChromeReleaseAsset('metamask-chrome-13.50.0.zip')).toBe(true);
    expect(isChromeReleaseAsset('coinbase-wallet-chrome-3.149.0.zip')).toBe(true);
  });

  it('rejects flask builds in both naming schemes', () => {
    expect(isChromeReleaseAsset('metamask-chrome-13.50.0-flask.0.zip')).toBe(false);
    expect(isChromeReleaseAsset('metamask-flask-chrome-13.17.0-flask.0.zip')).toBe(false);
  });

  it('rejects signatures and other browsers', () => {
    expect(isChromeReleaseAsset('metamask-chrome-13.50.0.zip.sigstore.json')).toBe(false);
    expect(isChromeReleaseAsset('metamask-firefox-13.50.0.zip')).toBe(false);
  });
});
