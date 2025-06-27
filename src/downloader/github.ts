import fs from 'fs';
import path from 'path';
import { request, RequestOptions } from './request';
import { DownloadError } from './config';

type GithubRelease = { downloadUrl: string; filename: string; tag: string };

export const getGithubRelease = async (releasesUrl: string, version: string): Promise<GithubRelease> => {
  const headers: Record<string, string> = { 'User-Agent': 'Mozilla/5.0' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const requestOptions: RequestOptions = { headers };

  try {
    const response = await request(releasesUrl, requestOptions);
    const body = await streamToString(response);
    const data = JSON.parse(body);

    if (data.message) {
      throw new DownloadError(
        `GitHub API error (URL: ${releasesUrl}): ${data.message}`,
        'NETWORK'
      );
    }

    // Find the matching release
    for (const result of data) {
      if (result.draft) continue;
      
      if (version === 'latest' || result.name.includes(version) || result.tag_name.includes(version)) {
        for (const asset of result.assets) {
          if (asset.name.includes('chrome')) {
            return {
              downloadUrl: asset.browser_download_url,
              filename: asset.name,
              tag: result.tag_name,
            };
          }
        }
      }
    }

    throw new DownloadError(`Version ${version} not found in releases`, 'NOT_FOUND');
  } catch (error) {
    if (error instanceof DownloadError) {
      throw error;
    }
    
    throw new DownloadError(
      `Failed to get GitHub release: ${error instanceof Error ? error.message : String(error)}`,
      'NETWORK',
      error instanceof Error ? error : undefined
    );
  }
};

export const downloadGithubRelease = async (name: string, url: string, location: string): Promise<string> => {
  if (!fs.existsSync(location)) {
    fs.mkdirSync(location, { recursive: true });
  }

  const fileLocation = path.join(location, name);

  try {
    const stream = await request(url);
    
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(fileLocation);
      
      stream.pipe(file);
      
      stream.on('end', () => {
        file.close();
        resolve(fileLocation);
      });
      
      stream.on('error', (error) => {
        file.close();
        // Clean up partial file on error
        fs.unlink(fileLocation, () => {}); // Ignore unlink errors
        reject(new DownloadError(`Download stream error: ${error.message}`, 'NETWORK', error));
      });
      
      file.on('error', (error) => {
        file.close();
        // Clean up partial file on error
        fs.unlink(fileLocation, () => {}); // Ignore unlink errors
        reject(new DownloadError(`File write error: ${error.message}`, 'NETWORK', error));
      });
    });
  } catch (error) {
    if (error instanceof DownloadError) {
      throw error;
    }
    
    throw new DownloadError(
      `Failed to download file: ${error instanceof Error ? error.message : String(error)}`,
      'NETWORK',
      error instanceof Error ? error : undefined
    );
  }
};

const streamToString = (stream: NodeJS.ReadableStream): Promise<string> => {
  return new Promise((resolve, reject) => {
    let body = '';
    
    stream.on('data', (chunk) => {
      body += chunk;
    });
    
    stream.on('end', () => {
      resolve(body);
    });
    
    stream.on('error', (error) => {
      reject(error);
    });
  });
};
