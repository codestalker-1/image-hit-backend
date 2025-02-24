import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import logger from "../utils/logger.js";
import { validateRequest } from "../utils/util.js";

export const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, config.JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = async (user) => {
  const token = jwt.sign({ id: user._id }, config.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await RefreshToken.create({ userId: user._id, tokenHash: token, expiresAt });
  return token;
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validationError = validateRequest({ email, password });
    if (validationError) {
      return res.status(400).json({ message: validationError.error });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.error(`Login attempt failed - User not found: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.error(`Login attempt failed - Incorrect password for: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);
    const refreshToken = await generateRefreshToken(user);
    logger.info(`User logged in successfully: ${email}`);

    return res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        lastLoginAt: user.lastLoginAt,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    return res.status(500).json({ message: "Failed to login" });
  }
};

// Logout User
export const logout = async (req, res) => {
  try {
    const { token } = req.body;
    const deletedToken = await RefreshToken.findOneAndDelete({
      tokenHash: token,
    });
    if (!deletedToken) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    logger.info("User logged out successfully");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error(`Logout failed: ${error.message}`);
    return res.status(500).json({ message: "Failed to logout" });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    const storedToken = await RefreshToken.findOne({ tokenHash: token });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    jwt.verify(token, config.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Invalid or expired refresh token" });
      }
      const newToken = generateToken({ _id: decoded.id });
      return res.status(200).json({ token: newToken });
    });
  } catch (error) {
    logger.error(`Refresh token failed: ${error.message}`);
    return res.status(500).json({ message: "Failed to refresh token" });
  }
};
