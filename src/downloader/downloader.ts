import fs from 'fs';
import path from 'path';

import { OfficialOptions } from '../types';
import { WalletIdOptions } from '../wallets/wallets';
import { DOWNLOAD_CONFIG, DOWNLOAD_STATE_FILES } from './constants';
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

  if (isPrimaryWorker() && !isDownloadComplete(paths)) {
    printVersion(walletId, version, recommendedVersion);
    await performDownload(walletId, version, releasesUrl, paths);
    return { path: paths.rootDir, wasDownloaded: true };
  } else {
    await waitForDownloadCompletion(walletId, paths);
    return { path: paths.rootDir, wasDownloaded: false };
  }
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
    cleanupDownloadingFlag(paths);
  }
}

/**
 * Create download state paths for a given directory
 */
function createDownloadStatePaths(downloadPath: string): DownloadStatePaths {
  return {
    rootDir: downloadPath,
    downloadingFile: path.join(downloadPath, DOWNLOAD_STATE_FILES.downloading),
    successFile: path.join(downloadPath, DOWNLOAD_STATE_FILES.success),
    errorFile: path.join(downloadPath, DOWNLOAD_STATE_FILES.error),
  };
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
 * Check if this is the primary worker responsible for downloading
 */
function isPrimaryWorker(): boolean {
  return process.env.TEST_PARALLEL_INDEX === '0';
}

/**
 * Wait for the primary worker to complete the download
 */
async function waitForDownloadCompletion(walletId: WalletIdOptions, paths: DownloadStatePaths): Promise<void> {
  while (!isDownloadComplete(paths)) {
    if (hasDownloadError(paths)) {
      const errorMessage = getErrorMessage(paths) || 'Unknown error';
      throw new Error(`Primary worker failed to download ${walletId}: ${errorMessage}`);
    }

    // eslint-disable-next-line no-console
    console.info(`Waiting for primary worker to download ${walletId}...`);
    await sleep(DOWNLOAD_CONFIG.pollIntervalMs);
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
