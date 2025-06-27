import fs from 'fs';
import path from 'path';
import { DownloadError } from './config';

export interface WorkerInfo {
  workerId: string;
  pid: number;
  startTime: number;
  lastHeartbeat: number;
  status: 'active' | 'downloading' | 'completed' | 'failed';
  walletId: string;
  version: string;
}

export interface WorkerMonitorOptions {
  /** Directory where worker info is stored */
  monitorDir?: string;
  /** Heartbeat interval in milliseconds */
  heartbeatInterval?: number;
  /** Worker timeout in milliseconds */
  workerTimeout?: number;
}

const DEFAULT_MONITOR_OPTIONS: Required<WorkerMonitorOptions> = {
  monitorDir: '/tmp/dappwright-workers',
  heartbeatInterval: 5_000, // 5 seconds
  workerTimeout: 60_000, // 1 minute
};

export class WorkerMonitor {
  private workerId: string;
  private workerPath: string;
  private options: Required<WorkerMonitorOptions>;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isActive = false;

  constructor(walletId: string, version: string, options: WorkerMonitorOptions = {}) {
    this.options = { ...DEFAULT_MONITOR_OPTIONS, ...options };
    this.workerId = `${process.pid}-${Date.now()}`;
    
    // Ensure monitor directory exists
    if (!fs.existsSync(this.options.monitorDir)) {
      fs.mkdirSync(this.options.monitorDir, { recursive: true });
    }

    const workerFileName = `worker-${this.workerId}.json`;
    this.workerPath = path.join(this.options.monitorDir, workerFileName);
  }

  /**
   * Register this worker and start heartbeat
   */
  async register(walletId: string, version: string): Promise<void> {
    const workerInfo: WorkerInfo = {
      workerId: this.workerId,
      pid: process.pid,
      startTime: Date.now(),
      lastHeartbeat: Date.now(),
      status: 'active',
      walletId,
      version,
    };

    try {
      fs.writeFileSync(this.workerPath, JSON.stringify(workerInfo, null, 2));
      this.isActive = true;
      this.startHeartbeat();
    } catch (error) {
      throw new DownloadError(
        `Failed to register worker: ${error instanceof Error ? error.message : String(error)}`,
        'NETWORK',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Update worker status
   */
  async updateStatus(status: WorkerInfo['status']): Promise<void> {
    if (!this.isActive) {
      return;
    }

    try {
      const existingInfo = this.getWorkerInfo();
      if (existingInfo) {
        existingInfo.status = status;
        existingInfo.lastHeartbeat = Date.now();
        fs.writeFileSync(this.workerPath, JSON.stringify(existingInfo, null, 2));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to update worker status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all active workers for a specific wallet/version
   */
  async getActiveWorkersFor(walletId: string, version: string): Promise<WorkerInfo[]> {
    try {
      const workers: WorkerInfo[] = [];
      const files = fs.readdirSync(this.options.monitorDir);
      
      for (const file of files) {
        if (!file.startsWith('worker-') || !file.endsWith('.json')) {
          continue;
        }
        
        try {
          const workerPath = path.join(this.options.monitorDir, file);
          const workerContent = fs.readFileSync(workerPath, 'utf-8');
          const workerInfo: WorkerInfo = JSON.parse(workerContent);
          
          // Check if worker is for the same wallet/version
          if (workerInfo.walletId !== walletId || workerInfo.version !== version) {
            continue;
          }
          
          // Check if worker is still alive
          if (this.isWorkerAlive(workerInfo)) {
            workers.push(workerInfo);
          } else {
            // Clean up dead worker
            fs.unlinkSync(workerPath);
          }
        } catch (error) {
          // Skip invalid worker files
          continue;
        }
      }
      
      return workers;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to get active workers: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Check if there are conflicting workers (race condition detection)
   */
  async hasConflictingWorkers(walletId: string, version: string): Promise<boolean> {
    const activeWorkers = await this.getActiveWorkersFor(walletId, version);
    const downloadingWorkers = activeWorkers.filter(w => w.status === 'downloading');
    
    // More than one worker downloading the same thing = race condition
    return downloadingWorkers.length > 1;
  }

  /**
   * Get the primary worker (oldest downloading worker)
   */
  async getPrimaryWorker(walletId: string, version: string): Promise<WorkerInfo | null> {
    const activeWorkers = await this.getActiveWorkersFor(walletId, version);
    const downloadingWorkers = activeWorkers.filter(w => w.status === 'downloading');
    
    if (downloadingWorkers.length === 0) {
      return null;
    }
    
    // Return the worker that started first
    return downloadingWorkers.reduce((oldest, current) => 
      current.startTime < oldest.startTime ? current : oldest
    );
  }

  /**
   * Cleanup worker registration
   */
  async cleanup(): Promise<void> {
    this.isActive = false;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    try {
      if (fs.existsSync(this.workerPath)) {
        fs.unlinkSync(this.workerPath);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to cleanup worker: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cleanup all dead workers
   */
  async cleanupDeadWorkers(): Promise<void> {
    try {
      const files = fs.readdirSync(this.options.monitorDir);
      
      for (const file of files) {
        if (!file.startsWith('worker-') || !file.endsWith('.json')) {
          continue;
        }
        
        try {
          const workerPath = path.join(this.options.monitorDir, file);
          const workerContent = fs.readFileSync(workerPath, 'utf-8');
          const workerInfo: WorkerInfo = JSON.parse(workerContent);
          
          if (!this.isWorkerAlive(workerInfo)) {
            fs.unlinkSync(workerPath);
          }
        } catch (error) {
          // Remove invalid worker files
          try {
            const workerPath = path.join(this.options.monitorDir, file);
            fs.unlinkSync(workerPath);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to cleanup dead workers: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getWorkerInfo(): WorkerInfo | null {
    try {
      const content = fs.readFileSync(this.workerPath, 'utf-8');
      return JSON.parse(content) as WorkerInfo;
    } catch {
      return null;
    }
  }

  private isWorkerAlive(workerInfo: WorkerInfo): boolean {
    const now = Date.now();
    const timeSinceHeartbeat = now - workerInfo.lastHeartbeat;
    
    // Worker is considered dead if no heartbeat for more than timeout
    if (timeSinceHeartbeat > this.options.workerTimeout) {
      return false;
    }
    
    // Additional check: try to verify if process is still running
    try {
      process.kill(workerInfo.pid, 0); // Signal 0 doesn't kill, just checks if process exists
      return true;
    } catch {
      return false;
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      return;
    }
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isActive) {
        this.updateHeartbeat();
      }
    }, this.options.heartbeatInterval);
  }

  private updateHeartbeat(): void {
    try {
      const workerInfo = this.getWorkerInfo();
      if (workerInfo) {
        workerInfo.lastHeartbeat = Date.now();
        fs.writeFileSync(this.workerPath, JSON.stringify(workerInfo, null, 2));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to update heartbeat: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Atomic file operations to prevent race conditions
 */
export class AtomicFileOperations {
  /**
   * Atomically check and create a marker file
   */
  static async atomicCreateMarker(filePath: string, content: string): Promise<boolean> {
    try {
      // Use exclusive flag to ensure atomic operation
      fs.writeFileSync(filePath, content, { flag: 'wx' });
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        return false; // File already exists
      }
      throw error;
    }
  }

  /**
   * Atomically move a file (rename operation is atomic on most filesystems)
   */
  static async atomicMove(sourcePath: string, targetPath: string): Promise<void> {
    try {
      fs.renameSync(sourcePath, targetPath);
    } catch (error) {
      throw new DownloadError(
        `Atomic move failed: ${error instanceof Error ? error.message : String(error)}`,
        'NETWORK',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Atomically check if a directory is complete (has expected content)
   */
  static async atomicValidateDirectory(dirPath: string, expectedFiles?: string[]): Promise<boolean> {
    try {
      if (!fs.existsSync(dirPath)) {
        return false;
      }
      
      const stats = fs.statSync(dirPath);
      if (!stats.isDirectory()) {
        return false;
      }
      
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        return false;
      }
      
      // If specific files are expected, check for them
      if (expectedFiles && expectedFiles.length > 0) {
        return expectedFiles.every(expectedFile => files.includes(expectedFile));
      }
      
      return true;
    } catch {
      return false;
    }
  }
}
