import fs from 'fs';

import { OfficialOptions } from '../types';
import { WalletIdOptions } from '../wallets/wallets';
import { downloadDir, editExtensionPubKey, extractZip, isEmpty } from './file';
import { downloadGithubRelease, getGithubRelease } from './github';
import { printVersion } from './version';
import { DownloadLock, isDownloadComplete } from './lockfile';
import { DownloadError } from './config';

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

export default (walletId: WalletIdOptions, releasesUrl: string, recommendedVersion: string) =>
  async (options: OfficialOptions): Promise<string> => {
    const { version } = options;
    const downloadPath = downloadDir(walletId, version);

    if (!version) {
      // eslint-disable-next-line no-console
      console.info(`Running tests on local ${walletId} build`);
      return downloadPath;
    }

    const lock = new DownloadLock(walletId, version);
    
    try {
      // Try to acquire lock for primary worker role
      const isLockAcquired = await lock.acquire();
      
      if (isLockAcquired) {
        // We are the primary worker
        // eslint-disable-next-line no-console
        console.info(`Primary worker: Downloading ${walletId} v${version}...`);
        printVersion(walletId, version, recommendedVersion);
        
        try {
          await download(walletId, version, releasesUrl, downloadPath);
          await lock.updateStatus('completed');
          // eslint-disable-next-line no-console
          console.info(`Primary worker: Successfully downloaded ${walletId} v${version}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await lock.updateStatus('failed', errorMessage);
          // eslint-disable-next-line no-console
          console.error(`Primary worker: Download failed for ${walletId} v${version}: ${errorMessage}`);
          throw error;
        } finally {
          await lock.release();
        }
      } else {
        // We are a secondary worker - wait for primary to complete
        // eslint-disable-next-line no-console
        console.info(`Secondary worker: Waiting for primary worker to download ${walletId} v${version}...`);
        
        try {
          await lock.waitForCompletion();
          // eslint-disable-next-line no-console
          console.info(`Secondary worker: Primary worker completed download of ${walletId} v${version}`);
        } catch (error) {
          if (error instanceof DownloadError && error.code === 'TIMEOUT') {
            // Primary worker timed out or crashed, try to become primary
            // eslint-disable-next-line no-console
            console.warn(`Secondary worker: Primary worker timed out, attempting to become primary for ${walletId} v${version}...`);
            
            const fallbackLock = new DownloadLock(walletId, version);
            const fallbackLockAcquired = await fallbackLock.acquire();
            
            if (fallbackLockAcquired) {
              try {
                printVersion(walletId, version, recommendedVersion);
                await download(walletId, version, releasesUrl, downloadPath);
                await fallbackLock.updateStatus('completed');
                // eslint-disable-next-line no-console
                console.info(`Fallback primary worker: Successfully downloaded ${walletId} v${version}`);
              } catch (downloadError) {
                const errorMessage = downloadError instanceof Error ? downloadError.message : String(downloadError);
                await fallbackLock.updateStatus('failed', errorMessage);
                throw downloadError;
              } finally {
                await fallbackLock.release();
              }
            } else {
              throw new DownloadError(`Failed to acquire fallback lock for ${walletId} v${version}`, 'TIMEOUT');
            }
          } else {
            throw error;
          }
        }
      }
      
      // Final validation that download is complete
      if (!isDownloadComplete(downloadPath)) {
        throw new DownloadError(`Download validation failed: ${downloadPath} is not complete`, 'NETWORK');
      }
      
      return downloadPath;
    } catch (error) {
      if (error instanceof DownloadError) {
        throw error;
      }
      
      throw new DownloadError(
        `Download coordination failed: ${error instanceof Error ? error.message : String(error)}`,
        'NETWORK',
        error instanceof Error ? error : undefined
      );
    }
  };

const download = async (
  walletId: WalletIdOptions,
  version: string,
  releasesUrl: string,
  downloadPath: string,
): Promise<void> => {
  // Skip download if already exists and is complete
  if (version !== 'latest' && isDownloadComplete(downloadPath)) {
    // eslint-disable-next-line no-console
    console.info(`${walletId} v${version} already downloaded and complete`);
    return;
  }

  try {
    // eslint-disable-next-line no-console
    console.info(`Fetching ${walletId} release info...`);
    const { filename, downloadUrl } = await getGithubRelease(releasesUrl, `v${version}`);

    // eslint-disable-next-line no-console
    console.info(`Downloading ${walletId} v${version} from ${downloadUrl}...`);
    
    // Clean up any partial downloads
    if (fs.existsSync(downloadPath)) {
      fs.rmSync(downloadPath, { recursive: true, force: true });
    }

    const walletFolder = downloadPath.split('/').slice(0, -1).join('/');
    const zipData = await downloadGithubRelease(filename, downloadUrl, walletFolder);
    
    // eslint-disable-next-line no-console
    console.info(`Extracting ${walletId} v${version}...`);
    await extractZip(zipData, downloadPath);

    // eslint-disable-next-line no-console
    console.info(`Configuring ${walletId} extension...`);
    editExtensionPubKey(downloadPath);
    
    // Final validation
    if (!isDownloadComplete(downloadPath)) {
      throw new DownloadError('Download completed but validation failed', 'NETWORK');
    }
    
    // eslint-disable-next-line no-console
    console.info(`${walletId} v${version} download and setup complete`);
  } catch (error) {
    // Clean up failed download
    if (fs.existsSync(downloadPath)) {
      try {
        fs.rmSync(downloadPath, { recursive: true, force: true });
      } catch (cleanupError) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to cleanup partial download: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
      }
    }
    
    if (error instanceof DownloadError) {
      throw error;
    }
    
    throw new DownloadError(
      `Download failed: ${error instanceof Error ? error.message : String(error)}`,
      'NETWORK',
      error instanceof Error ? error : undefined
    );
  }
};
