import { createPermission } from "../repository/permissionRepository.js";

export const createNewPermission = async (name) => {
  return await createPermission(name);
};
