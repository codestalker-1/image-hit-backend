import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import config from "../config/config.js";
import logger from "../utils/logger.js";
dotenv.config();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });
  try {
    const verified = jwt.verify(token, config.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    logger.error(error);
    res.status(400).json({ message: "Invalid token" });
  }
};

export default verifyToken;
