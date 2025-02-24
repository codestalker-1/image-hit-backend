import express from "express";
import { transformToController } from "../controllers/imageController.js";
const router = express.Router();

router.get("/", transformToController);

export default router;
