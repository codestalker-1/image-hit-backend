import { getAllRoleList, createNewRole } from "../services/roleService.js";

export const getRoles = async (req, res) => {
  try {
    const roles = await getAllRoleList();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching roles", error });
  }
};

export const createRole = async (req, res) => {
  const { name, permission } = req.body;

  // Validate input
  if (!name || !permission) {
    return res.status(400).json({
      success: false,
      message: "Invalid input: Role name and permissions are required.",
    });
  }

  try {
    const newRole = await createNewRole(name, permission);
    res.status(201).json({ success: true, data: newRole });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error creating role", error });
  }
};
