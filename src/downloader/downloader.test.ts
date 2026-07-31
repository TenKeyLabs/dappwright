/**
 * Unit tests for downloader.ts
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { OfficialOptions } from '../types';
import { DOWNLOAD_CLAIM_SUFFIX, DOWNLOAD_CONFIG, DOWNLOAD_STATE_FILES } from './constants';
import createWalletDownloader from './downloader';
import { downloadDir } from './file';

// Mock external dependencies
vi.mock('./github', () => ({
  getGithubRelease: vi.fn(),
  downloadGithubRelease: vi.fn(),
}));

vi.mock('./file', () => ({
  downloadDir: vi.fn(),
  editExtensionPubKey: vi.fn(),
  extractZip: vi.fn(),
}));

vi.mock('./version', () => ({
  printVersion: vi.fn(),
}));

// Import mocked functions
import { editExtensionPubKey, extractZip } from './file';
import { downloadGithubRelease, getGithubRelease } from './github';
import { printVersion } from './version';

// Create typed mocks
const mockGetGithubRelease = getGithubRelease as MockedFunction<typeof getGithubRelease>;
const mockDownloadGithubRelease = downloadGithubRelease as MockedFunction<typeof downloadGithubRelease>;
const mockEditExtensionPubKey = editExtensionPubKey as MockedFunction<typeof editExtensionPubKey>;
const mockExtractZip = extractZip as MockedFunction<typeof extractZip>;
const mockPrintVersion = printVersion as MockedFunction<typeof printVersion>;
const mockDownloadDir = downloadDir as MockedFunction<typeof downloadDir>;

describe('createWalletDownloader', () => {
  let testDir: string;
  const mockWalletId = 'metamask';
  const mockVersion = '12.16.0';
  const mockReleasesUrl = 'https://api.github.com/repos/MetaMask/metamask-extension/releases';
  const mockRecommendedVersion = '12.16.0';

  // Helper function to create a unique test directory
  const createTestDir = (): string => {
    const dir = path.join(os.tmpdir(), 'dappwright-test', Date.now().toString(), Math.random().toString(36));
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  };

  // Helper function to clean up test directory
  const cleanupTestDir = (dir: string): void => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };

  // Helper function to create state files
  const createStateFile = (dir: string, fileName: string, content = ''): void => {
    fs.writeFileSync(path.join(dir, fileName), content);
  };

  // Simulate another worker holding the download claim
  const claimDir = (): string => `${testDir}${DOWNLOAD_CLAIM_SUFFIX}`;
  const holdClaim = (ageMs = 0): void => {
    fs.mkdirSync(claimDir(), { recursive: true });
    const touched = new Date(Date.now() - ageMs);
    fs.utimesSync(claimDir(), touched, touched);
  };
  const releaseClaim = (): void => {
    fs.rmSync(claimDir(), { recursive: true, force: true });
  };

  beforeEach(() => {
    testDir = createTestDir();
    mockDownloadDir.mockReturnValue(testDir);

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    releaseClaim();
    cleanupTestDir(testDir);
  });

  describe('factory function behavior', () => {
    it('should create a downloader function', () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      expect(typeof downloader).toBe('function');
    });

    it('should return a function that accepts OfficialOptions', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: '',
      };

      const result = await downloader(options);

      expect(typeof result).toBe('string');
      expect(result).toBe(testDir);
    });
  });

  describe('local build scenario', () => {
    it('should handle empty version string', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: '',
      };

      const result = await downloader(options);

      expect(result).toBe(testDir);
      expect(mockPrintVersion).not.toHaveBeenCalled();
      expect(mockGetGithubRelease).not.toHaveBeenCalled();
    });

    it('should handle undefined version', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: undefined,
      };

      const result = await downloader(options);

      expect(result).toBe(testDir);
    });
  });

  describe('claiming worker download scenario', () => {
    it('should perform download when the claim is free and download not complete', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      mockGetGithubRelease.mockResolvedValue({
        filename: 'metamask-chrome-12.16.0.zip',
        downloadUrl:
          'https://github.com/MetaMask/metamask-extension/releases/download/v12.16.0/metamask-chrome-12.16.0.zip',
        tag: 'v12.16.0',
      });
      mockDownloadGithubRelease.mockResolvedValue('/tmp/metamask-chrome-12.16.0.zip');

      const result = await downloader(options);

      expect(result).toBe(testDir);
      expect(mockPrintVersion).toHaveBeenCalledWith(mockWalletId, mockVersion, mockRecommendedVersion);
      expect(mockGetGithubRelease).toHaveBeenCalledWith(mockReleasesUrl, '12.16.0');
      expect(mockDownloadGithubRelease).toHaveBeenCalled();
      expect(mockExtractZip).toHaveBeenCalled();
      expect(mockEditExtensionPubKey).toHaveBeenCalledWith(testDir);

      // Verify success file was created
      const successFile = path.join(testDir, DOWNLOAD_STATE_FILES.success);
      expect(fs.existsSync(successFile)).toBe(true);

      // Verify the claim was released for other workers
      expect(fs.existsSync(claimDir())).toBe(false);
    });

    it('should skip download if already complete', async () => {
      // Create success file to simulate completed download
      createStateFile(testDir, DOWNLOAD_STATE_FILES.success);

      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      const result = await downloader(options);

      expect(result).toBe(testDir);
      // printVersion is not called when download is already complete
      expect(mockPrintVersion).not.toHaveBeenCalled();
      expect(mockGetGithubRelease).not.toHaveBeenCalled();
    });

    it('should handle download errors properly', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      mockGetGithubRelease.mockRejectedValue(new Error('Network error'));

      await expect(downloader(options)).rejects.toThrow('Network error');

      // Verify error file was created
      const errorFile = path.join(testDir, DOWNLOAD_STATE_FILES.error);
      expect(fs.existsSync(errorFile)).toBe(true);
      expect(fs.readFileSync(errorFile, 'utf-8')).toBe('Network error');

      // Verify downloading flag was cleaned up
      const downloadingFile = path.join(testDir, DOWNLOAD_STATE_FILES.downloading);
      expect(fs.existsSync(downloadingFile)).toBe(false);

      // Verify the claim was released so another worker can retry
      expect(fs.existsSync(claimDir())).toBe(false);
    });

    it('should handle extraction errors', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      mockGetGithubRelease.mockResolvedValue({
        filename: 'test.zip',
        downloadUrl: 'https://example.com/test.zip',
        tag: 'v12.16.0',
      });
      mockDownloadGithubRelease.mockResolvedValue('/tmp/test.zip');
      mockExtractZip.mockRejectedValue(new Error('Extraction failed'));

      await expect(downloader(options)).rejects.toThrow('Extraction failed');

      const errorFile = path.join(testDir, DOWNLOAD_STATE_FILES.error);
      expect(fs.existsSync(errorFile)).toBe(true);
      expect(fs.readFileSync(errorFile, 'utf-8')).toBe('Extraction failed');
    });
  });

  describe('waiting worker scenario', () => {
    // Another worker already owns the download
    beforeEach(() => {
      holdClaim();
    });

    it('should wait for download completion', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      // Simulate the claim holder completing the download
      setTimeout(() => {
        createStateFile(testDir, DOWNLOAD_STATE_FILES.success);
        releaseClaim();
      }, 100);

      const result = await downloader(options);

      expect(result).toBe(testDir);
      expect(mockGetGithubRelease).not.toHaveBeenCalled();
    });

    it('should throw error when the claim holder fails', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      // Create error file to simulate failed download
      createStateFile(testDir, DOWNLOAD_STATE_FILES.error, 'Download failed: Network timeout');

      await expect(downloader(options)).rejects.toThrow(
        'Failed to download metamask: Download failed: Network timeout',
      );
    });

    it('should handle corrupted error file', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      // Create error file with corrupted content that can't be read properly
      const errorFile = path.join(testDir, DOWNLOAD_STATE_FILES.error);
      fs.writeFileSync(errorFile, Buffer.from([0xff, 0xfe]));

      // Make the file unreadable by changing permissions (if supported)
      try {
        fs.chmodSync(errorFile, 0o000);

        await expect(downloader(options)).rejects.toThrow(
          'Failed to download metamask: Unknown error occurred during download',
        );

        // Restore permissions for cleanup
        fs.chmodSync(errorFile, 0o644);
      } catch {
        // Skip test on systems that don't support chmod
        return;
      }
    });

    it('should take over the download when the claim holder gives up', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      mockGetGithubRelease.mockResolvedValue({
        filename: 'test.zip',
        downloadUrl: 'https://example.com/test.zip',
        tag: 'v12.16.0',
      });
      mockDownloadGithubRelease.mockResolvedValue('/tmp/test.zip');
      mockExtractZip.mockResolvedValue();

      // Claim released without a success or error marker
      setTimeout(releaseClaim, 100);

      const result = await downloader(options);

      expect(result).toBe(testDir);
      expect(mockGetGithubRelease).toHaveBeenCalledTimes(1);
      expect(fs.existsSync(path.join(testDir, DOWNLOAD_STATE_FILES.success))).toBe(true);
    });
  });

  describe('abandoned claim scenario', () => {
    it('should take over a claim that has stopped reporting progress', async () => {
      // Claim last touched well beyond the stale threshold, eg. a worker that was killed
      holdClaim(DOWNLOAD_CONFIG.staleClaimMs * 2);

      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      mockGetGithubRelease.mockResolvedValue({
        filename: 'test.zip',
        downloadUrl: 'https://example.com/test.zip',
        tag: 'v12.16.0',
      });
      mockDownloadGithubRelease.mockResolvedValue('/tmp/test.zip');
      mockExtractZip.mockResolvedValue();

      const result = await downloader(options);

      expect(result).toBe(testDir);
      expect(mockGetGithubRelease).toHaveBeenCalledTimes(1);
      expect(fs.existsSync(claimDir())).toBe(false);
    });

    it('should keep waiting on a claim that is still reporting progress', async () => {
      holdClaim();

      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      // Holder keeps the claim alive, then succeeds
      const heartbeat = setInterval(() => holdClaim(), 50);
      setTimeout(() => {
        clearInterval(heartbeat);
        createStateFile(testDir, DOWNLOAD_STATE_FILES.success);
        releaseClaim();
      }, DOWNLOAD_CONFIG.pollIntervalMs + 500);

      const result = await downloader(options);

      expect(result).toBe(testDir);
      expect(mockGetGithubRelease).not.toHaveBeenCalled();
    }, 11000);
  });

  describe('file system operations', () => {
    it('should prepare root directory correctly', async () => {
      // Create some existing content
      const existingFile = path.join(testDir, 'existing.txt');
      fs.writeFileSync(existingFile, 'existing content');
      expect(fs.existsSync(existingFile)).toBe(true);

      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      mockGetGithubRelease.mockResolvedValue({
        filename: 'test.zip',
        downloadUrl: 'https://example.com/test.zip',
        tag: 'v12.16.0',
      });
      mockDownloadGithubRelease.mockResolvedValue('/tmp/test.zip');
      mockExtractZip.mockResolvedValue();

      await downloader(options);

      // Directory should exist but existing file should be removed during preparation
      expect(fs.existsSync(testDir)).toBe(true);
      // Since prepareRootDir removes and recreates the directory, existing file won't exist
      expect(fs.existsSync(existingFile)).toBe(false);
    });

    it('should create directory if it does not exist', async () => {
      const nonExistentDir = path.join(testDir, 'nested', 'directory');
      mockDownloadDir.mockReturnValue(nonExistentDir);

      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      mockGetGithubRelease.mockResolvedValue({
        filename: 'test.zip',
        downloadUrl: 'https://example.com/test.zip',
        tag: 'v12.16.0',
      });
      mockDownloadGithubRelease.mockResolvedValue('/tmp/test.zip');
      mockExtractZip.mockResolvedValue();

      await downloader(options);

      expect(fs.existsSync(nonExistentDir)).toBe(true);

      // Cleanup the created directory
      cleanupTestDir(nonExistentDir);
    });

    it('should cleanup temporary files on success', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      // Pre-create error file
      createStateFile(testDir, DOWNLOAD_STATE_FILES.error, 'old error');

      mockGetGithubRelease.mockResolvedValue({
        filename: 'test.zip',
        downloadUrl: 'https://example.com/test.zip',
        tag: 'v12.16.0',
      });
      mockDownloadGithubRelease.mockResolvedValue('/tmp/test.zip');
      mockExtractZip.mockResolvedValue();

      await downloader(options);

      // Success file should exist, error file should be cleaned up
      const successFile = path.join(testDir, DOWNLOAD_STATE_FILES.success);
      const errorFile = path.join(testDir, DOWNLOAD_STATE_FILES.error);
      const downloadingFile = path.join(testDir, DOWNLOAD_STATE_FILES.downloading);

      expect(fs.existsSync(successFile)).toBe(true);
      expect(fs.existsSync(errorFile)).toBe(false);
      expect(fs.existsSync(downloadingFile)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle different wallet types', async () => {
      const coinbaseDownloader = createWalletDownloader('coinbase', mockReleasesUrl, '3.123.0');
      const options: OfficialOptions = {
        wallet: 'coinbase',
        version: '',
      };

      const result = await coinbaseDownloader(options);

      expect(result).toBe(testDir);
    });

    it('should handle non-string error objects', async () => {
      const downloader = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const options: OfficialOptions = {
        wallet: 'metamask',
        version: mockVersion,
      };

      // Mock rejection with non-Error object
      mockGetGithubRelease.mockRejectedValue({ code: 'NETWORK_ERROR', details: 'Connection failed' });

      await expect(downloader(options)).rejects.toEqual({ code: 'NETWORK_ERROR', details: 'Connection failed' });

      // Verify error file contains string representation
      const errorFile = path.join(testDir, DOWNLOAD_STATE_FILES.error);
      expect(fs.existsSync(errorFile)).toBe(true);
      expect(fs.readFileSync(errorFile, 'utf-8')).toBe('[object Object]');
    });
  });

  describe('concurrent execution', () => {
    const options: OfficialOptions = {
      wallet: 'metamask',
      version: mockVersion,
    };

    beforeEach(() => {
      mockGetGithubRelease.mockResolvedValue({
        filename: 'test.zip',
        downloadUrl: 'https://example.com/test.zip',
        tag: 'v12.16.0',
      });
      mockDownloadGithubRelease.mockResolvedValue('/tmp/test.zip');
      mockExtractZip.mockResolvedValue();
    });

    it('should handle multiple downloaders running simultaneously', async () => {
      const downloader1 = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);
      const downloader2 = createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion);

      // Run both downloaders simultaneously
      const [result1, result2] = await Promise.all([downloader1(options), downloader2(options)]);

      expect(result1).toBe(testDir);
      expect(result2).toBe(testDir);
    }, 11000);

    it('should download exactly once regardless of which worker gets there first', async () => {
      const downloaders = Array.from({ length: 5 }, () =>
        createWalletDownloader(mockWalletId, mockReleasesUrl, mockRecommendedVersion),
      );

      const results = await Promise.all(downloaders.map((downloader) => downloader(options)));

      expect(results).toEqual(Array(5).fill(testDir));
      expect(mockGetGithubRelease).toHaveBeenCalledTimes(1);
      expect(mockExtractZip).toHaveBeenCalledTimes(1);
    }, 11000);
  });
});
