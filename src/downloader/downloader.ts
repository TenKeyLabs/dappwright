import fs from 'fs';

import { OfficialOptions } from '../types';
import { WalletIdOptions } from '../wallets/wallets';
import { downloadDir, editExtensionPubKey, extractZip, isEmpty } from './file';
import { downloadGithubRelease, getGithubRelease } from './github';
import { printVersion } from './version';

// Overrides for consistent navigation experience across wallets extensions
export const EXTENSION_ID = 'gadekpdjmpjjnnemgnhkbjgnjpdaakgh';
export const EXTENSION_PUB_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnpiOcYGaEp02v5On5luCk/4g9j+ujgWeGlpZVibaSz6kUlyiZvcVNIIUXR568uv5NrEi5+j9+HbzshLALhCn9S43E7Ha6Xkdxs3kOEPBu8FRNwFh2S7ivVr6ixnl2FCGwfkP1S1r7k665eC1/xYdJKGCc8UByfSw24Rtl5odUqZX1SaE6CsQEMymCFcWhpE3fV+LZ6RWWJ63Zm1ac5KmKzXdj7wZzN3onI0Csc8riBZ0AujkThJmCR8tZt2PkVUDX9exa0XkJb79pe0Ken5Bt2jylJhmQB7R3N1pVNhNQt17Sytnwz6zG2YsB2XNd/1VYJe52cPNJc7zvhQJpHjh5QIDAQAB';

export type Path =
  | string
  | {
      download: string;
      extract: string;
    };

const SECONDARY_WORKER_TIMEOUT_MS = 300000; // 5 minutes max wait
const SECONDARY_WORKER_POLL_INTERVAL_MS = 2000; // Check every 2 seconds

export default (walletId: WalletIdOptions, releasesUrl: string, recommendedVersion: string) =>
  async (options: OfficialOptions): Promise<string> => {
    const { version } = options;
    const downloadPath = downloadDir(walletId, version);

    if (!version) {
      // eslint-disable-next-line no-console
      console.info(`Running tests on local ${walletId} build`);
      return downloadPath;
    }

    if (process.env.TEST_PARALLEL_INDEX === '0') {
      // Primary worker downloads
      printVersion(walletId, version, recommendedVersion);
      await download(walletId, version, releasesUrl, downloadPath);
    } else {
      // Secondary workers wait for primary to complete
      await waitForPrimaryDownload(walletId, downloadPath);
    }

    return downloadPath;
  };

const waitForPrimaryDownload = async (walletId: WalletIdOptions, downloadPath: string): Promise<void> => {
  const startTime = Date.now();
  
  // eslint-disable-next-line no-console
  console.info(`Waiting for primary worker to download ${walletId}...`);
  
  while (Date.now() - startTime < SECONDARY_WORKER_TIMEOUT_MS) {
    if (fs.existsSync(downloadPath) && !isEmpty(downloadPath)) {
      // eslint-disable-next-line no-console
      console.info(`${walletId} download completed by primary worker`);
      return;
    }
    
    await new Promise((resolve) => setTimeout(resolve, SECONDARY_WORKER_POLL_INTERVAL_MS));
  }
  
  throw new Error(`Timeout waiting for primary worker to download ${walletId} after ${SECONDARY_WORKER_TIMEOUT_MS}ms`);
};

const download = async (
  walletId: WalletIdOptions,
  version: string,
  releasesUrl: string,
  downloadPath: string,
): Promise<void> => {
  if (version !== 'latest' && fs.existsSync(downloadPath) && !isEmpty(downloadPath)) return;

  // eslint-disable-next-line no-console
  console.info(`Downloading ${walletId}...`);

  const { filename, downloadUrl } = await getGithubRelease(releasesUrl, `v${version}`);

  if (!fs.existsSync(downloadPath) || isEmpty(downloadPath)) {
    const walletFolder = downloadPath.split('/').slice(0, -1).join('/');
    const zipData = await downloadGithubRelease(filename, downloadUrl, walletFolder);
    await extractZip(zipData, downloadPath);

    editExtensionPubKey(downloadPath);
  }
};
