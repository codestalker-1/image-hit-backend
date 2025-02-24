import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  verifyAdmin,
  authorizePermission,
} from "../middlewares/authMiddleware.js";
import { register, createRole } from "../controllers/adminController.js";
const router = express.Router();

/**
 * Route: Create a new user (Only Admins with "write" permission)
 */
router.post(
  "/create-user",
  //  verifyToken,
  //  verifyAdmin,
  //  authorizePermission("write"),
  register
);

/**
 * Route: create a new role
 */
router.get(
  "/create-role",
  verifyToken,
  verifyAdmin,
  authorizePermission("write"),
  createRole
);

export default router;
