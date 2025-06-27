import { IncomingMessage } from 'http';
import { get } from 'https';
import { DEFAULT_DOWNLOAD_CONFIG, DownloadConfig, DownloadError } from './config';

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  maxRetryDelay?: number;
  headers?: Record<string, string>;
}

export const request = (url: string, options: RequestOptions = {}): Promise<IncomingMessage> => {
  const config = { ...DEFAULT_DOWNLOAD_CONFIG, ...options };
  return requestWithRetry(url, config, config.retries);
};

const requestWithRetry = async (
  url: string,
  config: DownloadConfig & { headers?: Record<string, string> },
  retriesLeft: number,
): Promise<IncomingMessage> => {
  try {
    return await requestWithTimeout(url, config);
  } catch (error) {
    if (retriesLeft <= 0) {
      throw new DownloadError(
        `Request failed after ${config.retries} attempts: ${error instanceof Error ? error.message : String(error)}`,
        'RETRY_EXHAUSTED',
        error instanceof Error ? error : undefined,
      );
    }

    const delay = calculateRetryDelay(config.retries - retriesLeft, config.retryDelay, config.maxRetryDelay);
    
    // eslint-disable-next-line no-console
    console.warn(`Request failed, retrying in ${delay}ms (${retriesLeft} attempts left): ${error instanceof Error ? error.message : String(error)}`);
    
    await sleep(delay);
    return requestWithRetry(url, config, retriesLeft - 1);
  }
};

const requestWithTimeout = (
  url: string,
  config: DownloadConfig & { headers?: Record<string, string> },
): Promise<IncomingMessage> =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      request.destroy();
      reject(new DownloadError(`Request timeout after ${config.timeout}ms`, 'TIMEOUT'));
    }, config.timeout);

    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        ...config.headers,
      },
    };

    const request = get(url, requestOptions, (response) => {
      clearTimeout(timeout);
      
      if (response.statusCode === 302 && response.headers.location) {
        // Handle redirect
        const redirectRequest = get(response.headers.location, requestOptions, resolve);
        redirectRequest.on('error', (error) => {
          reject(new DownloadError(`Redirect request failed: ${error.message}`, 'NETWORK', error));
        });
        
        // Set timeout for redirect request
        const redirectTimeout = setTimeout(() => {
          redirectRequest.destroy();
          reject(new DownloadError(`Redirect request timeout after ${config.timeout}ms`, 'TIMEOUT'));
        }, config.timeout);
        
        redirectRequest.on('response', () => clearTimeout(redirectTimeout));
      } else if (response.statusCode && response.statusCode >= 400) {
        reject(new DownloadError(`HTTP ${response.statusCode}: ${response.statusMessage}`, 'NETWORK'));
      } else {
        resolve(response);
      }
    });

    request.on('error', (error) => {
      clearTimeout(timeout);
      reject(new DownloadError(`Network error: ${error.message}`, 'NETWORK', error));
    });
  });

const calculateRetryDelay = (attempt: number, baseDelay: number, maxDelay: number): number => {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
};

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
