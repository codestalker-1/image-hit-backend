import url from "url";
import path from "path";
import {
  fileExists,
  createDirectory,
  downloadFileSync,
  getHostname,
  getBaseName,
  getFileExtension,
} from "./file.js";
import { parseImageParams, processImage } from "./imageProcessor.js";
import { allowedUrl } from "../utils/util.js";
import logger from "../utils/logger.js";

const directoryPath = path.resolve("cache");
const parsedUrl = (urlString) => url.parse(urlString, true);

function getDirectoryName(domain, pathname, width, height) {
  return (
    directoryPath +
    "/" +
    getHostname(domain) +
    path.dirname(pathname) +
    `/${width}x${height}/`
  );
}

const getRequestDetails = (request) => {
  const parsedRequestUrl = parsedUrl(request.originalUrl);
  return {
    requestHost: request.headers.host,
    domain: allowedUrl[request.headers.host],
    parsedRequestUrl,
    tranformationRequest: parsedRequestUrl.query.tr,
  };
};

const constructImageData = (parsedRequestUrl, domain) => {
  const imagePath = parsedRequestUrl.pathname;
  const imageName = getBaseName(imagePath);
  const imageExtension = getFileExtension(imagePath);
  const cacheDirectory = getDirectoryName(domain, imagePath, 0, 0);
  const cachedFilePath = cacheDirectory + imageName;
  return {
    downloadUrl: domain + imagePath,
    imageName,
    imageExtension,
    cacheDirectory,
    cachedFilePath,
  };
};

export const getImage = async (req, res) => {
  const { parsedRequestUrl, domain, requestHost, tranformationRequest } =
    getRequestDetails(req);

  const tranformationRequestObject = parseImageParams(tranformationRequest);

  let {
    downloadUrl,
    imageName,
    imageExtension,
    cacheDirectory,
    cachedFilePath,
  } = constructImageData(parsedRequestUrl, domain);

  fileExists(cachedFilePath).then(async (exists) => {
    if (exists) {
      if (!tranformationRequest) sendFile(res, cachedFilePath);

      processImage(cachedFilePath, tranformationRequestObject)
        .then((outputPath) => sendFile(res, outputPath))
        .catch((err) => console.error(err));
    } else {
      await createDirectory(cacheDirectory);
      const newFile = await downloadFileSync(downloadUrl, cachedFilePath);
      sendFile(res, newFile);
    }
  });
};

const sendFile = (res, filePath) => {
  logger.info(`Sending file: ${filePath}`);
  res.sendFile(filePath);
};
