export interface DownloadConfig {
  /** Request timeout in milliseconds (default: 10s for primary worker) */
  timeout: number;
  /** Maximum number of retry attempts (default: 3) */
  retries: number;
  /** Base retry delay in milliseconds (default: 1s) */
  retryDelay: number;
  /** Maximum retry delay in milliseconds (default: 10s) */
  maxRetryDelay: number;
  /** Secondary worker timeout in milliseconds (default: 15s) */
  secondaryWorkerTimeout: number;
}

export const DEFAULT_DOWNLOAD_CONFIG: DownloadConfig = {
  timeout: 10_000, // 10 seconds - fail fast for E2E
  retries: 3,
  retryDelay: 1_000, // 1 second
  maxRetryDelay: 10_000, // 10 seconds
  secondaryWorkerTimeout: 15_000, // 15 seconds
};

export class DownloadError extends Error {
  constructor(
    message: string,
    public readonly code: 'TIMEOUT' | 'NETWORK' | 'NOT_FOUND' | 'RETRY_EXHAUSTED',
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'DownloadError';
  }
}
