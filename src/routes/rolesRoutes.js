import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  verifyAdmin,
  authorizePermission,
} from "../middlewares/authMiddleware.js";
import { createRole, getRoles } from "../controllers/roleController.js";
const router = express.Router();

/**
 * Route: get all roles list
 */
router.get("/", getRoles);

/**
 * Route: create new role
 */
router.post("/create", createRole);

export default router;
