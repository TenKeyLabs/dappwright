import fs from 'fs';
import { get } from 'https';
import path from 'path';
import { request } from './request';

type GithubRelease = { downloadUrl: string; filename: string; tag: string };

const TIMEOUT_MS = 15000; // 15 seconds
const MAX_RETRIES = 3;

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

const withRetry = async <T>(fn: () => Promise<T>, retries: number = MAX_RETRIES): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await withTimeout(fn(), TIMEOUT_MS);
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      }
    }
  }
  
  throw lastError;
};

export const getGithubRelease = (releasesUrl: string, version: string): Promise<GithubRelease> =>
  withRetry(() => new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const options = { headers: { 'User-Agent': 'Mozilla/5.0' } };
    if (process.env.GITHUB_TOKEN) options.headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    const request = get(releasesUrl, options, (response) => {
      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        const data = JSON.parse(body);
        if (data.message)
          return reject(
            `There was a problem connecting to github API to get the extension release (URL: ${releasesUrl}). Error: ${data.message}`,
          );
        for (const result of data) {
          if (result.draft) continue;
          if (version === 'latest' || result.name.includes(version) || result.tag_name.includes(version)) {
            for (const asset of result.assets) {
              if (asset.name.includes('chrome'))
                resolve({
                  downloadUrl: asset.browser_download_url,
                  filename: asset.name,
                  tag: result.tag_name,
                });
            }
          }
        }
        reject(`Version ${version} not found!`);
      });
    });
    request.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.warn('getGithubRelease error:', error.message);
      reject(error);
    });
  }));

export const downloadGithubRelease = (name: string, url: string, location: string): Promise<string> =>
  withRetry(async () => new Promise(async (resolve, reject) => {
    if (!fs.existsSync(location)) {
      fs.mkdirSync(location, { recursive: true });
    }
    const fileLocation = path.join(location, name);
    const file = fs.createWriteStream(fileLocation);
    try {
      const stream = await request(url);
      stream.pipe(file);
      stream.on('end', () => {
        resolve(fileLocation);
      });
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  }));
