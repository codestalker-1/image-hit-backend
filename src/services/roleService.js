import {
  getAllRolesFromDB,
  createNewRole as createRoleInDb,
} from "../repository/roleRepository.js";
import { getAllPermissionFromDbByName } from "../repository/permissionRepository.js";

/*
[
 {
    "name": "Admin",
    "permissions": [
      { "_id": "65e03b2d84f2c1a1b8e4d9a4", "name": "read" },
      { "_id": "65e03b2d84f2c1a1b8e4d9a5", "name": "write" }
    ]
  }
]
*/

const getAllRoles = async () => await getAllRolesFromDB();

/*
    [ "Admin",  "Editor",  "Viewer"  ]
*/
export const getAllRoleList = async () => {
  const roles = await getAllRoles();
  return roles.map((role) => role?.name);
};

export const createNewRole = async (roleName, permissionName) => {
  try {
    const permission = await getAllPermissionFromDbByName(permissionName);
    if (!permission) {
      logger.error(`No permission found ${permissionName} `);
    }
    await createRoleInDb(roleName, permission._id);
  } catch (error) {
    logger.error(`Error while creating a new role : ${role}`);
    throw error;
  }
};
