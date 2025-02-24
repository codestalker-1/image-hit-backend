import { createNewPermission } from "../services/permissionService.js";
import { getAllRoleList, createNewRole } from "../services/roleService.js";

export const createPermission = async (req, res) => {
  const { name } = req.body;
  try {
    await createNewPermission(name);
    res.status(200).json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error creating permission", error });
  }
};
