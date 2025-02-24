import Role from "../models/Role.js";
import logger from "../utils/logger.js";

export const getAllRolesFromDB = async () => {
  try {
    const allRoles = await Role.find({});
    return allRoles;
  } catch (error) {
    logger.error("Error fetching roles from DB :", error);
    throw error;
  }
};

export const createNewRole = async (roleName, permissionId) => {
  try {
    const newRole = newRole.save(
      new Role({
        name: roleName,
        permission: permissionId,
      })
    );
    logger.info("New roles created ");
    return newRole;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
