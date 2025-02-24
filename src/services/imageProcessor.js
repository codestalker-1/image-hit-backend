import fs from "fs";
import path from "path";
import Sharp from "sharp";
import logger from "../utils/logger.js";

export function parseImageParams(atts) {
  let width = 0,
    height = 0,
    rotate = 0,
    crop = false,
    quality = 80,
    resize = false,
    format = "";

  if (typeof atts !== "undefined" && atts.length > 0) {
    atts = atts.split(",");
    let filters = {};

    atts.forEach((att) => {
      let [key, value] = att.split("-");
      filters[key] = value;
    });

    Object.entries(filters).forEach(([key, value]) => {
      switch (key) {
        case "w":
          width = parseInt(value);
          resize = true;
          break;
        case "h":
          height = parseInt(value);
          resize = true;
          break;
        case "q":
          quality = parseInt(value);
          break;
        case "c":
          crop = value;
          break;
        case "f":
          format = value;
          break;
        case "r":
          rotate = parseInt(value);
          break;
      }
    });
  }

  return { width, height, crop, quality, resize, format, rotate };
}

function applyImageFormat(image, format, quality) {
  logger.info(`Applying format: ${format} and quality: ${quality}`);
  switch (format) {
    case "jpeg":
      image.jpeg({ quality });
      break;
    case "png":
      image.png({ quality });
      break;
    case "webp":
      image.webp({ quality });
      break;
  }
}

function resizeImage(image, width, height, resize) {
  if (resize) {
    if (width > 0 && height === 0) {
      image.resize({ width });
    } else if (width === 0 && height > 0) {
      image.resize({ height });
    } else if (width > 0 && height > 0) {
      image.resize({ width, height });
    }
  }
}

function createDirectory(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}
export async function processImage(filePath, transformObject) {
  logger.info(
    `Processing image: ${filePath} with ${JSON.stringify(transformObject)}`
  );

  let suffixes = [];

  // Construct the output directory path
  const parentDir = path.dirname(path.dirname(filePath));
  const directory = path.join(
    parentDir,
    `${transformObject.width || "0"}x${transformObject.height || "0"}`
  );
  createDirectory(directory); // Ensure directory exists

  // Determine file extension
  const extension = transformObject.format
    ? `.${transformObject.format}`
    : path.extname(filePath);

  // Generate suffix string based on transformations
  if (transformObject.rotate) suffixes.push(`rotated${transformObject.rotate}`);
  if (transformObject.bgRemove) suffixes.push("bgRemoved");

  const suffixString = suffixes.length ? `_${suffixes.join("_")}` : "";
  const outputFilePath = path.join(
    directory,
    `${path.basename(
      filePath,
      path.extname(filePath)
    )}${suffixString}${extension}`
  );

  // **Check if image already exists**
  if (fs.existsSync(outputFilePath)) {
    logger.info(`Image already exists: ${outputFilePath}`);
    return outputFilePath;
  }

  // **Apply transformations**
  let image = Sharp(filePath);

  if (transformObject.width || transformObject.height) {
    image = image.resize(transformObject.width, transformObject.height, {
      fit: transformObject.resize || "cover",
    });
  }

  if (transformObject.format || transformObject.quality) {
    applyImageFormat(image, transformObject.format, transformObject.quality);
  }

  if (transformObject.rotate) {
    image = image.rotate(transformObject.rotate);
  }

  if (transformObject.bgRemove) {
    removeBackground(image);
  }

  try {
    const data = await image.toBuffer();
    fs.writeFileSync(outputFilePath, data);
    logger.info(`Image saved: ${outputFilePath}`);
    return outputFilePath;
  } catch (err) {
    logger.error("Sharp Error:", err);
    return "";
  }
}
