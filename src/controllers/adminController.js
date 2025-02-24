import User from "../models/User.js";
import bcrypt from "bcryptjs";
import logger from "../utils/logger.js";
import { validateRequest } from "../utils/util.js";
import { generateRefreshToken, generateToken } from "./authController.js";
import Role from "../models/Role.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, isAdmin } = req.body;

    // Validate request fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.error(`User already exists with email: ${email}`);
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if this is the first user and make them admin
    const isFirstUser = (await User.countDocuments()) === 0;

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      lastLoginAt: new Date(),
      isAdmin: isAdmin,
    });

    // Assign role if role is provided
    if (role) {
      const roleRes = await Role.findOne({ name: role });
      if (!role) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = roleRes._id;
    }

    await user.save();
    logger.info(`User registered successfully with email: ${email}`);

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    return res.status(201).json({
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
    logger.error(`Registration failed: ${error}`);
    return res.status(500).json({ message: "Failed to register user" });
  }
};

export const createRole = async (req, res) => {
  res.status(201).json({
    message: "new role created",
  });
};
