import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  verifyAdmin,
  authorizePermission,
} from "../middlewares/authMiddleware.js";
import AllowedUrl from "../models/AllowedUrl.js";
const router = express.Router();

router.post("/add-url", verifyToken, async (req, res) => {
  try {
    const { domain, url } = req.body;
    const newUrl = new AllowedUrl({ domain, url, createdBy: req.user.id });
    await newUrl.save();
    res.status(201).json({ message: "URL added successfully", data: newUrl });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
