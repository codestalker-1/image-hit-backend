import Role from "../models/Role.js";
import logger from "../utils/logger.js";

export const getAllRolesFromDB = async () => {
  try {
    logger.info("Fetching roles from DB...");
    const allRoles = await Role.find({});
    logger.info("Fetched roles from DB successfully.");
    return allRoles;
  } catch (error) {
    logger.error("Error fetching roles from DB :", error);
    throw error;
  }
};

export const createNewRole = async (roleName, permissionId) => {
  try {
    const newRole = new Role({
      name: roleName,
      permission: permissionId,
    });
    return await newRole.save();
  } catch (error) {
    logger.error(error);
  }
};
