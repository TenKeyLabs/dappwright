import fs from 'fs';
import { WalletIdOptions } from '../wallets/wallets';
import { OfficialOptions } from '../types';
import { downloadDir, isEmpty } from './file';
import { printVersion } from './version';
import { DownloadLock, isDownloadComplete, validateAndCleanCache, validateCacheIntegrity } from './lockfile';
import { WorkerMonitor, AtomicFileOperations } from './worker-monitor';
import { DownloadError, DEFAULT_DOWNLOAD_CONFIG } from './config';
import { getGithubRelease, downloadGithubRelease } from './github';
import { extractZip, editExtensionPubKey } from './file';
import path from 'path';

// Extension ID for consistent navigation experience across wallets extensions
export const EXTENSION_ID = 'gadekpdjmpjjnnemgnhkbjgnjpdaakgh';

// Download function implementation
const download = async (
  walletId: WalletIdOptions,
  version: string,
  releasesUrl: string,
  downloadPath: string,
): Promise<void> => {
  try {
    console.info(`Fetching ${walletId} release info...`);
    const { filename, downloadUrl } = await getGithubRelease(releasesUrl, `v${version}`);

    console.info(`Downloading ${walletId} v${version} from ${downloadUrl}...`);
    
    // Clean up any partial downloads
    if (fs.existsSync(downloadPath)) {
      fs.rmSync(downloadPath, { recursive: true, force: true });
    }

    const walletFolder = downloadPath.split('/').slice(0, -1).join('/');
    const zipData = await downloadGithubRelease(filename, downloadUrl, walletFolder);
    
    console.info(`Extracting ${walletId} v${version}...`);
    await extractZip(zipData, downloadPath);

    console.info(`Configuring ${walletId} extension...`);
    editExtensionPubKey(downloadPath);
    
    // Final validation
    if (!isDownloadComplete(downloadPath)) {
      throw new DownloadError('Download completed but validation failed', 'NETWORK');
    }
    
    console.info(`${walletId} v${version} download and setup complete`);
  } catch (error) {
    // Clean up failed download
    if (fs.existsSync(downloadPath)) {
      try {
        fs.rmSync(downloadPath, { recursive: true, force: true });
      } catch (cleanupError) {
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

export default (walletId: WalletIdOptions, releasesUrl: string, recommendedVersion: string) =>
  async (options: OfficialOptions): Promise<string> => {
    const { version } = options;
    const downloadPath = downloadDir(walletId, version);

    if (!version) {
      console.info(`Running tests on local ${walletId} build`);
      return downloadPath;
    }

    // Initialize worker monitor for parallel execution safety
    const workerMonitor = new WorkerMonitor(walletId, version);
    const downloadLock = new DownloadLock(walletId, version);
    
    try {
      // Register this worker
      await workerMonitor.register(walletId, version);
      
      // Clean up dead workers and validate cache
      await workerMonitor.cleanupDeadWorkers();
      await validateAndCleanCache(path.dirname(downloadPath));
      
      // Check if download already exists and is valid
      if (isDownloadComplete(downloadPath)) {
        const isValid = await validateCacheIntegrity(downloadPath);
        if (isValid) {
          console.info(`Using existing ${walletId} v${version} download`);
          await workerMonitor.updateStatus('completed');
          return downloadPath;
        } else {
          console.warn(`Existing ${walletId} download is corrupted, re-downloading`);
          fs.rmSync(downloadPath, { recursive: true, force: true });
        }
      }
      
      // Check for race conditions
      const hasConflictingWorkers = await workerMonitor.hasConflictingWorkers(walletId, version);
      if (hasConflictingWorkers) {
        console.warn(`Detected race condition: multiple workers downloading ${walletId} v${version}`);
        
        // Get the primary worker (oldest)
        const primaryWorker = await workerMonitor.getPrimaryWorker(walletId, version);
        if (primaryWorker && primaryWorker.workerId !== workerMonitor['workerId']) {
          console.info(`Deferring to primary worker ${primaryWorker.workerId}`);
          await downloadLock.waitForCompletion();
          
          if (!isDownloadComplete(downloadPath)) {
            throw new DownloadError(`Primary worker completed but download is missing`, 'NETWORK');
          }
          
          return downloadPath;
        }
      }

      // Try to acquire download lock
      const lockAcquired = await downloadLock.acquire();
      
      if (lockAcquired) {
        // We are the primary worker
        console.info(`Primary worker downloading ${walletId} v${version}...`);
        printVersion(walletId, version, recommendedVersion);
        
        await workerMonitor.updateStatus('downloading');
        
        try {
          // Create temp directory for atomic download
          const tempDir = `${downloadPath}.tmp.${Date.now()}`;
          
          // Download to temp directory first
          await download(walletId, version, releasesUrl, tempDir);
          
          // Validate the download
          if (!isDownloadComplete(tempDir)) {
            throw new DownloadError(`Download validation failed for ${walletId} v${version}`, 'NETWORK');
          }
          
          // Atomically move to final location
          await AtomicFileOperations.atomicMove(tempDir, downloadPath);
          
          // Mark as completed
          await downloadLock.updateStatus('completed');
          await workerMonitor.updateStatus('completed');
          
          console.info(`Successfully downloaded ${walletId} v${version}`);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Primary worker download failed: ${errorMessage}`);
          
          // Clean up failed download
          const tempDir = `${downloadPath}.tmp.${Date.now()}`;
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
          if (fs.existsSync(downloadPath)) {
            fs.rmSync(downloadPath, { recursive: true, force: true });
          }
          
          await downloadLock.updateStatus('failed', errorMessage);
          await workerMonitor.updateStatus('failed');
          
          throw error;
        }
        
      } else {
        // We are a secondary worker
        console.info(`Secondary worker waiting for ${walletId} v${version} download...`);
        await workerMonitor.updateStatus('active');
        
        try {
          // Wait for primary worker to complete
          await downloadLock.waitForCompletion();
          
          // Verify download exists and is valid
          if (!isDownloadComplete(downloadPath)) {
            throw new DownloadError(`Primary worker completed but download is missing`, 'NETWORK');
          }
          
          const isValid = await validateCacheIntegrity(downloadPath);
          if (!isValid) {
            throw new DownloadError(`Primary worker download is corrupted`, 'NETWORK');
          }
          
          await workerMonitor.updateStatus('completed');
          console.info(`Secondary worker received ${walletId} v${version}`);
          
        } catch (error) {
          if (error instanceof DownloadError && error.code === 'TIMEOUT') {
            // Primary worker timed out, try to become primary
            console.warn(`Primary worker timed out, attempting to become primary worker`);
            
            const retryLockAcquired = await downloadLock.acquire();
            if (retryLockAcquired) {
              console.info(`Became primary worker, downloading ${walletId} v${version}...`);
              
              await workerMonitor.updateStatus('downloading');
              
              try {
                // Clean up any partial downloads
                if (fs.existsSync(downloadPath)) {
                  fs.rmSync(downloadPath, { recursive: true, force: true });
                }
                
                // Download with shorter timeout for fallback
                const tempDir = `${downloadPath}.tmp.${Date.now()}`;
                await download(walletId, version, releasesUrl, tempDir);
                
                if (!isDownloadComplete(tempDir)) {
                  throw new DownloadError(`Fallback download validation failed`, 'NETWORK');
                }
                
                await AtomicFileOperations.atomicMove(tempDir, downloadPath);
                await downloadLock.updateStatus('completed');
                await workerMonitor.updateStatus('completed');
                
                console.info(`Fallback download completed for ${walletId} v${version}`);
                
              } catch (fallbackError) {
                const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
                await downloadLock.updateStatus('failed', errorMessage);
                await workerMonitor.updateStatus('failed');
                throw fallbackError;
              }
            } else {
              // Another worker became primary, wait again
              console.info(`Another worker became primary, waiting again...`);
              await downloadLock.waitForCompletion();
              
              if (!isDownloadComplete(downloadPath)) {
                throw new DownloadError(`Fallback primary worker failed`, 'NETWORK');
              }
            }
          } else {
            await workerMonitor.updateStatus('failed');
            throw error;
          }
        }
      }
      
    } finally {
      // Always cleanup
      await downloadLock.release();
      await workerMonitor.cleanup();
    }

    return downloadPath;
  };
