import axios from 'axios';
import * as fs from 'fs';
import bz2 from 'unbzip2-stream';
import * as stream from 'stream';
import { promisify } from 'util';

const TMP_FILE_PATH = './tmp/version.txt';
const LATEST_DB_URL = 'https://github.com/phpcfdi/resources-sat-catalogs/releases/latest/download/catalogs.db.bz2';
const VERSIONS_DB_URL = 'https://api.github.com/repos/phpcfdi/resources-sat-catalogs/tags';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Fetch the latest version tag from the GitHub API
 */
const headers = GITHUB_TOKEN
  ? { Authorization: `token ${GITHUB_TOKEN}` }
  : {};

async function getLatestVersion(): Promise<string> {
  const response = await axios.get(VERSIONS_DB_URL, {
    headers
  });
  const tags = response.data as Array<any>;

  if (tags.length === 0) {
    throw new Error("No tags found!");
  }

  return tags[0].name;
}

/**
 * Check if the current version is up-to-date
 */
function isCurrentVersionUpToDate(newVersion: string): boolean {
  if (!fs.existsSync(TMP_FILE_PATH)) {
    return false; // If the file doesn't exist, it's not up-to-date
  }

  const currentVersion = fs.readFileSync(TMP_FILE_PATH, { encoding: 'utf8' });
  return currentVersion.trim() === newVersion.trim();
}

/**
 * Update the local version file
 */
function updateVersionFile(version: string): void {
  fs.writeFileSync(TMP_FILE_PATH, version, { encoding: 'utf8' });
}

/**
 * Download the latest database and decompress it
 */
async function downloadAndDecompressDb(): Promise<void> {
  const response = await axios({
    method: 'get',
    url: LATEST_DB_URL,
    responseType: 'stream',
    headers
  });

  const pipeline = promisify(stream.pipeline);

  await pipeline(
    response.data,
    bz2(),
    fs.createWriteStream('./tmp/catalogs.db')
  );
}

/**
 * Orchestrate the update process
 */
export async function performUpdateIfNeeded(): Promise<void> {
  try {
    const latestVersion = await getLatestVersion();

    if (!isCurrentVersionUpToDate(latestVersion)) {
      console.log(`Updating to new version: ${latestVersion}`);
      updateVersionFile(latestVersion);
      await downloadAndDecompressDb();
      console.log('Database updated successfully!');
    } else {
      console.log('Database is already up-to-date.');
    }
  } catch (error) {
    console.error('Error during update:', error);
  }
}

