import Permission from "../models/Permission.js";
import logger from "../utils/logger.js";

export const getAllPermissionFromDB = async () => {
  try {
    logger.info("Fetching permissions from DB...");
    const allPermissions = await Permission.find({});
    logger.info("Fetched permissions from DB successfully.");
    return allPermissions;
  } catch (error) {
    logger.error("Error fetching permissions from DB:", error);
    throw error;
  }
};

export const getAllPermissionFromDbByName = async (permissionName) => {
  try {
    logger.info("Fetching permissions from DB...");
    const permission = await Permission.findOne({ name: permissionName });
    if (!permission) {
      logger.warn(`Permission '${permissionName}' not found.`);
      return null;
    }
    logger.info("Fetched permissions successfully:", permission);
    return permission;
  } catch (error) {
    logger.error("Error fetching permissions from DB:", error);
    throw error;
  }
};

export const createPermission = async (name) => {
  try {
    await Permission.create({ name });
  } catch (error) {
    logger.error("Error creating permission", error);
    throw error;
  }
};
