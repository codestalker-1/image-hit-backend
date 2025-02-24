import fs from "fs-extra";
import axios from "axios";
import path from "path";
import logger from "../utils/logger.js";

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}
export const getFileExtension = (pathString) =>
  path.extname(pathString).slice(1).toLowerCase();

export const getBaseName = (pathString) => path.basename(pathString);
export function getHostname(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    logger.error("Invalid URL:", error);
    return null;
  }
}

export async function createDirectory(directory) {
  try {
    await fs.ensureDir(directory);
    console.log(`Directory created or already exists: ${directory}`);
  } catch (error) {
    console.error(`Error creating directory: ${error}`);
  }
}

export async function downloadFileSync(downloadUrl, savePath) {
  console.log(`Starting download: ${downloadUrl}`);

  try {
    // Ensure directory exists
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directory created: ${dir}`);
    }

    const response = await axios.get(downloadUrl, { responseType: "stream" });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Download failed with status: ${response.status}`);
    }

    await streamToFile(response.data, savePath);
    console.log(`Download completed: ${savePath}`);

    return savePath; // ✅ Return the file path
  } catch (error) {
    console.error(`Download error: ${error.message}`);
    throw error;
  }
}

/**
 * Writes a readable stream to a file synchronously.
 * @param {stream.Readable} stream - The readable stream.
 * @param {string} filePath - The path to save the file.
 * @returns {Promise<void>}
 */
function streamToFile(stream, filePath) {
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    stream.pipe(writer);

    writer.on("finish", resolve);
    writer.on("error", (err) =>
      reject(new Error(`File write error: ${err.message}`))
    );
  });
}
