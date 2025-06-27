import fs from 'fs';
import path from 'path';
import { DownloadError } from './config';

export interface LockOptions {
  /** Directory where lock files are stored */
  lockDir?: string;
  /** Lock timeout in milliseconds */
  timeout?: number;
  /** Polling interval in milliseconds */
  pollInterval?: number;
  /** Stale lock cleanup time in milliseconds (default: 5 minutes) */
  staleTimeout?: number;
}

export interface DownloadStatus {
  status: 'downloading' | 'completed' | 'failed';
  startTime: number;
  workerId: string;
  version: string;
  error?: string;
}

const DEFAULT_LOCK_OPTIONS: Required<LockOptions> = {
  lockDir: '/tmp/dappwright-locks',
  timeout: 15_000, // 15 seconds for secondary workers
  pollInterval: 1_000, // Check every 1 second
  staleTimeout: 300_000, // 5 minutes
};

export class DownloadLock {
  private lockPath: string;
  private statusPath: string;
  private workerId: string;
  private options: Required<LockOptions>;
  private isLocked = false;

  constructor(walletId: string, version: string, options: LockOptions = {}) {
    this.options = { ...DEFAULT_LOCK_OPTIONS, ...options };
    this.workerId = `${process.pid}-${Date.now()}`;
    
    // Ensure lock directory exists
    if (!fs.existsSync(this.options.lockDir)) {
      fs.mkdirSync(this.options.lockDir, { recursive: true });
    }

    const lockFileName = `${walletId}-${version.replace(/\./g, '_')}.lock`;
    const statusFileName = `${walletId}-${version.replace(/\./g, '_')}.status`;
    
    this.lockPath = path.join(this.options.lockDir, lockFileName);
    this.statusPath = path.join(this.options.lockDir, statusFileName);
  }

  /**
   * Acquire lock for downloading - returns true if acquired, false if another worker has it
   */
  async acquire(): Promise<boolean> {
    try {
      // Clean up stale locks first
      await this.cleanupStaleLocks();

      // Try to acquire lock atomically
      const lockContent = JSON.stringify({
        workerId: this.workerId,
        pid: process.pid,
        timestamp: Date.now(),
      });

      // Use exclusive flag to ensure atomic operation
      fs.writeFileSync(this.lockPath, lockContent, { flag: 'wx' });
      this.isLocked = true;
      
      // Update status to downloading
      await this.updateStatus('downloading');
      
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        // Lock already exists - another worker has it
        return false;
      }
      throw new DownloadError(`Failed to acquire lock: ${error instanceof Error ? error.message : String(error)}`, 'NETWORK', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Wait for download to complete by another worker
   */
  async waitForCompletion(): Promise<void> {
    const startTime = Date.now();
    const endTime = startTime + this.options.timeout;

    while (Date.now() < endTime) {
      const status = await this.getStatus();
      
      if (status?.status === 'completed') {
        return;
      }
      
      if (status?.status === 'failed') {
        throw new DownloadError(`Primary worker download failed: ${status.error || 'Unknown error'}`, 'NETWORK');
      }
      
      // Check if lock is stale (primary worker may have crashed)
      if (await this.isLockStale()) {
        throw new DownloadError('Primary worker lock is stale - worker may have crashed', 'TIMEOUT');
      }
      
      // Wait before checking again
      await this.sleep(this.options.pollInterval);
    }
    
    throw new DownloadError(`Timeout waiting for primary worker to complete download (${this.options.timeout}ms)`, 'TIMEOUT');
  }

  /**
   * Update download status
   */
  async updateStatus(status: DownloadStatus['status'], error?: string): Promise<void> {
    if (!this.isLocked && status !== 'failed') {
      throw new DownloadError('Cannot update status without holding lock', 'NETWORK');
    }

    const statusData: DownloadStatus = {
      status,
      startTime: Date.now(),
      workerId: this.workerId,
      version: '', // Will be set by caller
      error,
    };

    try {
      fs.writeFileSync(this.statusPath, JSON.stringify(statusData, null, 2));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to update download status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get current download status
   */
  async getStatus(): Promise<DownloadStatus | null> {
    try {
      const statusContent = fs.readFileSync(this.statusPath, 'utf-8');
      return JSON.parse(statusContent) as DownloadStatus;
    } catch {
      return null;
    }
  }

  /**
   * Release the lock
   */
  async release(): Promise<void> {
    if (this.isLocked) {
      try {
        fs.unlinkSync(this.lockPath);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to release lock: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      try {
        fs.unlinkSync(this.statusPath);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to remove status file: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      this.isLocked = false;
    }
  }

  /**
   * Check if the current lock is stale
   */
  private async isLockStale(): Promise<boolean> {
    try {
      const lockContent = fs.readFileSync(this.lockPath, 'utf-8');
      const lockData = JSON.parse(lockContent);
      const lockAge = Date.now() - lockData.timestamp;
      
      return lockAge > this.options.staleTimeout;
    } catch {
      // If we can't read the lock, consider it stale
      return true;
    }
  }

  /**
   * Clean up stale locks from crashed workers
   */
  private async cleanupStaleLocks(): Promise<void> {
    try {
      if (fs.existsSync(this.lockPath)) {
        const isStale = await this.isLockStale();
        if (isStale) {
          // eslint-disable-next-line no-console
          console.warn('Cleaning up stale lock file');
          fs.unlinkSync(this.lockPath);
          
          if (fs.existsSync(this.statusPath)) {
            fs.unlinkSync(this.statusPath);
          }
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to cleanup stale locks: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Utility function to check if download is complete and valid
 */
export const isDownloadComplete = (downloadPath: string): boolean => {
  try {
    if (!fs.existsSync(downloadPath)) {
      return false;
    }
    
    const stats = fs.statSync(downloadPath);
    if (!stats.isDirectory()) {
      return false;
    }
    
    // Check if directory has content (not empty)
    const files = fs.readdirSync(downloadPath);
    return files.length > 0;
  } catch {
    return false;
  }
};
