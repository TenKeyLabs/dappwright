/**
 * Constants used across the downloader module
 */

// Overrides for consistent navigation experience across wallet extensions
export const EXTENSION_ID = 'gadekpdjmpjjnnemgnhkbjgnjpdaakgh';
export const EXTENSION_PUB_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnpiOcYGaEp02v5On5luCk/4g9j+ujgWeGlpZVibaSz6kUlyiZvcVNIIUXR568uv5NrEi5+j9+HbzshLALhCn9S43E7Ha6Xkdxs3kOEPBu8FRNwFh2S7ivVr6ixnl2FCGwfkP1S1r7k665eC1/xYdJKGCc8UByfSw24Rtl5odUqZX1SaE6CsQEMymCFcWhpE3fV+LZ6RWWJ63Zm1ac5KmKzXdj7wZzN3onI0Csc8riBZ0AujkThJmCR8tZt2PkVUDX9exa0XkJb79pe0Ken5Bt2jylJhmQB7R3N1pVNhNQt17Sytnwz6zG2YsB2XNd/1VYJe52cPNJc7zvhQJpHjh5QIDAQAB';

// File markers for download state tracking
export const DOWNLOAD_STATE_FILES = {
  downloading: '.downloading',
  success: '.success',
  error: '.error',
} as const;

// Suffix for the directory used to claim ownership of a download
export const DOWNLOAD_CLAIM_SUFFIX = '.claim';

// Configuration constants
export const DOWNLOAD_CONFIG = {
  pollIntervalMs: 2000,
  heartbeatIntervalMs: 2000, // How often the claim holder touches the claim directory to signal it is still alive
  staleClaimMs: 30000, // A claim that hasn't been touched within this window is considered abandoned
  maxWaitMs: 600000, // Upper bound on how long a worker will wait for another worker's download
} as const;
