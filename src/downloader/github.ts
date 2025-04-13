import fs from 'fs';
import { get } from 'https';
import path from 'path';
import { request } from './request';

type GithubRelease = { downloadUrl: string; filename: string; tag: string };

export const getGithubRelease = (releasesUrl: string, version: string): Promise<GithubRelease> =>
  new Promise((resolve, reject) => {
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
      throw error;
    });
  });

export const downloadGithubRelease = (name: string, url: string, location: string): Promise<string> =>
  new Promise(async (resolve) => {
    if (!fs.existsSync(location)) {
      fs.mkdirSync(location, { recursive: true });
    }
    const fileLocation = path.join(location, name);
    const file = fs.createWriteStream(fileLocation);
    const stream = await request(url);
    stream.pipe(file);
    stream.on('end', () => {
      resolve(fileLocation);
    });
  });
