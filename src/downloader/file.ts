import fs from 'fs';
import StreamZip from 'node-stream-zip';
import os from 'os';
import path from 'path';
import { WalletIdOptions } from '../wallets/wallets';

// Extension public key constant - moved here to avoid circular dependency
export const EXTENSION_PUB_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnpiOcYGaEp02v5On5luCk/4g9j+ujgWeGlpZVibaSz6kUlyiZvcVNIIUXR568uv5NrEi5+j9+HbzshLALhCn9S43E7Ha6Xkdxs3kOEPBu8FRNwFh2S7ivVr6ixnl2FCGwfkP1S1r7k665eC1/xYdJKGCc8UByfSw24Rtl5odUqZX1SaE6CsQEMymCFcWhpE3fV+LZ6RWWJ63Zm1ac5KmKzXdj7wZzN3onI0Csc8riBZ0AujkThJmCR8tZt2PkVUDX9exa0XkJb79pe0Ken5Bt2jylJhmQB7R3N1pVNhNQt17Sytnwz6zG2YsB2XNd/1VYJe52cPNJc7zvhQJpHjh5QIDAQAB';

export const downloadDir = (walletId: WalletIdOptions, version: string): string => {
  return path.resolve(os.tmpdir(), 'dappwright', walletId, version.replace(/\./g, '_'));
};

export const isEmpty = (folderPath: string): boolean => {
  const items = fs.readdirSync(folderPath, { withFileTypes: true });
  const files = items.filter((item) => item.isFile() && !item.name.startsWith('.'));
  return files.length === 0;
};

export const extractZip = async (zipData: string, destination: string): Promise<void> => {
  const zip = new StreamZip.async({ file: zipData });
  fs.mkdirSync(destination, { recursive: true });
  await zip.extract(null, destination);
};

// Set the chrome extension public key
export const editExtensionPubKey = (extensionPath: string): void => {
  const manifestPath = path.resolve(extensionPath, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  manifest.key = EXTENSION_PUB_KEY;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
};
