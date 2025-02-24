export const validateRequest = (fields) => {
  const missingFields = Object.entries(fields)
    .filter(([_, value]) => !value || value.trim() === "")
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return {
      error: `The following fields are required: ${missingFields.join(", ")}`,
    };
  }

  return null;
};

export let allowedUrl = {
  "cdn1.ethoswatches.com": "https://www.ethoswatches.com",
  "cdn4.ethoswatches.com": "https://www.ethoswatches.com",
  "images.secondtimezone.com": "https://www.secondtimezone.com",
  "images.secondmovement.com": "https://www.secondmovement.com",
  "images.ethoswatches.com": "https://emanage.ethoswatches.com",
};

export let mine = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export let mimeToSave = {
  jpg: "image/jpeg",
  png: "image/png",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
};
