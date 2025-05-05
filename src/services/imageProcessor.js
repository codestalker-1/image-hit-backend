import fs from "fs";
import path from "path";
import Sharp from "sharp";
import logger from "../utils/logger.js";

// Constants for default values and supported formats
const DEFAULT_VALUES = {
  QUALITY: 80,
  WIDTH: 0,
  HEIGHT: 0,
  ROTATE: 0
};

const SUPPORTED_FORMATS = ['jpeg', 'png', 'webp', 'avif'];

// Type definitions for better code documentation
/**
 * @typedef {Object} ImageParams
 * @property {number} width - Image width
 * @property {number} height - Image height
 * @property {boolean} crop - Crop setting
 * @property {number} quality - Image quality
 * @property {boolean} resize - Resize flag
 * @property {string} format - Image format
 * @property {number} rotate - Rotation angle
 */

export function parseImageParams(atts) {
  logger.debug(`Parsing image parameters: ${atts}`);
  const params = {
    width: DEFAULT_VALUES.WIDTH,
    height: DEFAULT_VALUES.HEIGHT,
    rotate: DEFAULT_VALUES.ROTATE,
    crop: false,
    quality: DEFAULT_VALUES.QUALITY,
    resize: false,
    format: ""
  };

  if (!atts?.length) return params;

  const filters = atts.split(",").reduce((acc, att) => {
    const [key, value] = att.split("-");
    return { ...acc, [key]: value };
  }, {});

  const parameterMap = {
    w: { key: 'width', transform: parseInt, setResize: true },
    h: { key: 'height', transform: parseInt, setResize: true },
    q: { key: 'quality', transform: parseInt },
    c: { key: 'crop', transform: (v) => v },
    f: { key: 'format', transform: (v) => v },
    r: { key: 'rotate', transform: parseInt }
  };

  Object.entries(filters).forEach(([key, value]) => {
    const parameter = parameterMap[key];
    if (parameter) {
      params[parameter.key] = parameter.transform(value);
      if (parameter.setResize) params.resize = true;
    }
  });

  logger.debug(`Parsed parameters:`, params);
  return params;
}

function applyImageFormat(image, format, quality) {
  logger.debug(`Applying format transformation - format: ${format}, quality: ${quality}`);
  if (!format || !SUPPORTED_FORMATS.includes(format)) {
    // If no format specified, apply quality to the existing format
    const options = quality ? { quality } : {};
    logger.debug(`Applying quality transformation with options:`, options);
    return image.jpeg(options).png(options).webp(options);
  }
  
  logger.info(`Applying format: ${format} and quality: ${quality}`);
  const options = quality ? { quality } : {};
  image[format](options);
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

/**
 * Processes image with given transformations
 * @param {string} filePath - Path to source image
 * @param {ImageParams} transformObject - Transformation parameters
 * @returns {Promise<string>} Path to processed image
 */
export async function processImage(filePath, transformObject) {
  try {
    logger.info(`Processing image: ${filePath}`, transformObject);

    const outputPath = generateOutputPath(filePath, transformObject);
    
    if (fs.existsSync(outputPath)) {
      logger.info(`Image already exists: ${outputPath}`);
      return outputPath;
    }

    const image = await applyTransformations(filePath, transformObject);
    await saveImage(image, outputPath);
    
    return outputPath;
  } catch (error) {
    logger.error("Image processing failed:", error);
    return "";
  }
}

/**
 * Generates output path for processed image
 * @private
 */
function generateOutputPath(filePath, transformObject) {
  const suffixes = generateSuffixes(transformObject);
  const parentDir = path.dirname(path.dirname(filePath));
  const directory = path.join(
    parentDir,
    `${transformObject.width || "0"}x${transformObject.height || "0"}`
  );
  
  createDirectory(directory);
  
  const extension = transformObject.format
    ? `.${transformObject.format}`
    : path.extname(filePath);
    
  const baseName = path.basename(filePath, path.extname(filePath));
  const suffixString = suffixes.length ? `_${suffixes.join("_")}` : "";
  
  return path.join(directory, `${baseName}${suffixString}${extension}`);
}

/**
 * Generates transformation suffixes for filename
 * @private
 */
function generateSuffixes(transformObject) {
  const suffixRules = [
    { condition: transformObject.width || transformObject.height, 
      value: () => `${transformObject.width || 0}x${transformObject.height || 0}` },
    { condition: transformObject.quality, value: () => `q${transformObject.quality}` },
    { condition: transformObject.rotate, value: () => `r${transformObject.rotate}` },
    { condition: transformObject.format, value: () => `f${transformObject.format}` },
    { condition: transformObject.crop, value: () => `c${transformObject.crop}` },
    { condition: transformObject.bgRemove, value: () => "bgRemoved" }
  ];

  return suffixRules
    .filter(rule => rule.condition)
    .map(rule => rule.value());
}

/**
 * Applies image transformations
 * @private
 */
async function applyTransformations(filePath, transformObject) {
  const image = Sharp(filePath);

  if (transformObject.width || transformObject.height) {
    image.resize(transformObject.width, transformObject.height, {
      fit: transformObject.resize || "cover",
    });
  }

  if (transformObject.format || transformObject.quality) {
    applyImageFormat(image, transformObject.format, transformObject.quality);
  }

  if (transformObject.rotate) {
    image.rotate(transformObject.rotate);
  }

  if (transformObject.bgRemove) {
    await removeBackground(image);
  }

  return image;
}

/**
 * Saves processed image to disk
 * @private
 */
async function saveImage(image, outputPath) {
  const data = await image.toBuffer();
  fs.writeFileSync(outputPath, data);
  logger.info(`Image saved: ${outputPath}`);
}
