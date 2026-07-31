import fs from 'fs';
import path from 'path';

import { OfficialOptions } from '../types';
import { WalletIdOptions } from '../wallets/wallets';
import { DOWNLOAD_CLAIM_SUFFIX, DOWNLOAD_CONFIG, DOWNLOAD_STATE_FILES } from './constants';
import { downloadDir, editExtensionPubKey, extractZip } from './file';
import { downloadGithubRelease, getGithubRelease } from './github';
import { printVersion } from './version';

type DownloadResult = {
  path: string;
  wasDownloaded: boolean;
};

// Re-export constants for backward compatibility

/**
 * Download state file paths for a given directory
 */
interface DownloadStatePaths {
  readonly rootDir: string;
  readonly claimDir: string;
  readonly downloadingFile: string;
  readonly successFile: string;
  readonly errorFile: string;
}

/**
 * Main download function - creates and coordinates wallet extension downloads
 *
 * @param walletId - The wallet identifier
 * @param releasesUrl - GitHub releases URL for the wallet
 * @param recommendedVersion - The recommended version to suggest
 * @returns Function that handles the download process
 */
const createWalletDownloader = (walletId: WalletIdOptions, releasesUrl: string, recommendedVersion: string) => {
  return async (options: OfficialOptions): Promise<string> => {
    const { version } = options;
    const result = await downloadWalletExtension(walletId, version, releasesUrl, recommendedVersion);
    return result.path;
  };
};

async function downloadWalletExtension(
  walletId: WalletIdOptions,
  version: string,
  releasesUrl: string,
  recommendedVersion: string,
): Promise<DownloadResult> {
  const paths = createDownloadStatePaths(downloadDir(walletId, version));

  if (!version) {
    // eslint-disable-next-line no-console
    console.info(`Running tests on local ${walletId} build`);
    return { path: paths.rootDir, wasDownloaded: false };
  }

  // Workers race for the claim rather than electing a downloader by worker index. Index based
  // election breaks as soon as more than one wallet is downloaded concurrently (eg. parallel
  // Playwright projects), since only one worker holds index 0 and every worker for the other
  // wallet would wait on a download that is never started.
  while (!isDownloadComplete(paths)) {
    if (claimDownload(paths)) {
      try {
        printVersion(walletId, version, recommendedVersion);
        await performDownload(walletId, version, releasesUrl, paths);
      } finally {
        releaseClaim(paths);
      }
      return { path: paths.rootDir, wasDownloaded: true };
    }

    // Lost the race. Wait for the holder, then re-check: the loop re-claims if it gave up.
    await waitForClaimHolder(walletId, paths);
  }

  return { path: paths.rootDir, wasDownloaded: false };
}

/**
 * Perform the actual download process
 */
async function performDownload(
  walletId: WalletIdOptions,
  version: string,
  releasesUrl: string,
  paths: DownloadStatePaths,
): Promise<void> {
  prepareRootDir(paths);
  markDownloadStarted(paths);

  const heartbeat = startClaimHeartbeat(paths);

  try {
    // eslint-disable-next-line no-console
    console.info(`Downloading ${walletId} ${version}...`);

    const releaseInfo = await getGithubRelease(releasesUrl, version);
    const walletFolder = path.dirname(paths.rootDir);
    const zipPath = await downloadGithubRelease(releaseInfo.filename, releaseInfo.downloadUrl, walletFolder);

    await extractZip(zipPath, paths.rootDir);
    editExtensionPubKey(paths.rootDir);

    markDownloadSuccess(paths);
  } catch (error) {
    handleDownloadError(paths, error);
    throw error;
  } finally {
    clearInterval(heartbeat);
    cleanupDownloadingFlag(paths);
  }
}

/**
 * Create download state paths for a given directory
 */
function createDownloadStatePaths(downloadPath: string): DownloadStatePaths {
  return {
    rootDir: downloadPath,
    // Sits beside the download rather than inside it, since preparing the root wipes it
    claimDir: `${downloadPath}${DOWNLOAD_CLAIM_SUFFIX}`,
    downloadingFile: path.join(downloadPath, DOWNLOAD_STATE_FILES.downloading),
    successFile: path.join(downloadPath, DOWNLOAD_STATE_FILES.success),
    errorFile: path.join(downloadPath, DOWNLOAD_STATE_FILES.error),
  };
}

/**
 * Attempt to take ownership of the download.
 *
 * `mkdir` fails when the directory already exists, which makes it an atomic compare-and-set
 * across processes - exactly one caller can win, no matter how many race for it.
 */
function claimDownload(paths: DownloadStatePaths): boolean {
  fs.mkdirSync(path.dirname(paths.claimDir), { recursive: true });

  try {
    fs.mkdirSync(paths.claimDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    return false;
  }

  // Clear the previous attempt's failure before any waiter can observe it
  deleteFileIfExists(paths.errorFile);
  return true;
}

/**
 * Release ownership of the download
 */
function releaseClaim(paths: DownloadStatePaths): void {
  fs.rmSync(paths.claimDir, { recursive: true, force: true });
}

/**
 * Check whether a claim is currently held
 */
function isClaimHeld(paths: DownloadStatePaths): boolean {
  return fs.existsSync(paths.claimDir);
}

/**
 * Check whether the claim holder has stopped reporting progress (eg. the process was killed)
 */
function isClaimStale(paths: DownloadStatePaths): boolean {
  try {
    return Date.now() - fs.statSync(paths.claimDir).mtimeMs > DOWNLOAD_CONFIG.staleClaimMs;
  } catch {
    // Released while we were looking at it
    return false;
  }
}

/**
 * Touch the claim directory periodically so waiters can tell a slow download from a dead one
 */
function startClaimHeartbeat(paths: DownloadStatePaths): NodeJS.Timeout {
  const heartbeat = setInterval(() => {
    try {
      const now = new Date();
      fs.utimesSync(paths.claimDir, now, now);
    } catch {
      // Claim directory is gone - nothing to keep alive
    }
  }, DOWNLOAD_CONFIG.heartbeatIntervalMs);

  // Don't hold the process open on the heartbeat alone
  heartbeat.unref?.();
  return heartbeat;
}

/**
 * Check if download completed successfully
 */
function isDownloadComplete(paths: DownloadStatePaths): boolean {
  return fs.existsSync(paths.successFile);
}

/**
 * Check if download failed
 */
function hasDownloadError(paths: DownloadStatePaths): boolean {
  return fs.existsSync(paths.errorFile);
}

/**
 * Get error message from failed download
 */
function getErrorMessage(paths: DownloadStatePaths): string | null {
  if (!hasDownloadError(paths)) {
    return null;
  }

  try {
    return fs.readFileSync(paths.errorFile, 'utf-8');
  } catch {
    return 'Unknown error occurred during download';
  }
}

/**
 * Ensure the root directory exists
 */
function ensureRootDirExists(rootDir: string): void {
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }
}

/**
 * Mark download as starting
 */
function markDownloadStarted(paths: DownloadStatePaths): void {
  ensureRootDirExists(paths.rootDir);
  fs.writeFileSync(paths.downloadingFile, '');
}

/**
 * Mark download as successful and cleanup temporary files
 */
function markDownloadSuccess(paths: DownloadStatePaths): void {
  fs.writeFileSync(paths.successFile, '');
  deleteFileIfExists(paths.errorFile);
}

/**
 * Mark download as failed with error message
 */
function markDownloadError(paths: DownloadStatePaths, errorMessage: string): void {
  ensureRootDirExists(paths.rootDir);
  fs.writeFileSync(paths.errorFile, errorMessage);
}

/**
 * Clean up the downloading flag file
 */
function cleanupDownloadingFlag(paths: DownloadStatePaths): void {
  deleteFileIfExists(paths.downloadingFile);
}

/**
 * Prepare root directory for download by cleaning and creating it
 */
function prepareRootDir(paths: DownloadStatePaths): void {
  if (fs.existsSync(paths.rootDir)) {
    fs.rmSync(paths.rootDir, { recursive: true, force: true });
  }
  fs.mkdirSync(paths.rootDir, { recursive: true });
}

/**
 * Utility function to safely delete a file if it exists
 */
function deleteFileIfExists(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Utility function for sleeping/waiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for the worker holding the claim to finish downloading.
 *
 * Returns once the download succeeded, or once the claim is free again so the caller can take
 * it over - either because the holder released it without succeeding, or because it went stale.
 */
async function waitForClaimHolder(walletId: WalletIdOptions, paths: DownloadStatePaths): Promise<void> {
  const deadline = Date.now() + DOWNLOAD_CONFIG.maxWaitMs;

  while (true) {
    // eslint-disable-next-line no-console
    console.info(`Waiting for another worker to download ${walletId}...`);
    await sleep(DOWNLOAD_CONFIG.pollIntervalMs);

    if (isDownloadComplete(paths)) return;

    if (hasDownloadError(paths)) {
      const errorMessage = getErrorMessage(paths) || 'Unknown error';
      throw new Error(`Failed to download ${walletId}: ${errorMessage}`);
    }

    // Claim released without a result - fall back to the caller so it can claim the download
    if (!isClaimHeld(paths)) return;

    if (isClaimStale(paths)) {
      // eslint-disable-next-line no-console
      console.info(`Abandoned ${walletId} download detected, taking over...`);
      releaseClaim(paths);
      return;
    }

    if (Date.now() > deadline) {
      throw new Error(
        `Timed out after ${DOWNLOAD_CONFIG.maxWaitMs}ms waiting for another worker to download ${walletId}`,
      );
    }
  }
}

/**
 * Handle download errors by logging and marking the error state
 */
function handleDownloadError(paths: DownloadStatePaths, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  markDownloadError(paths, errorMessage);
}

export default createWalletDownloader;
