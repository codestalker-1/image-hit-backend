import User from "../models/User.js";
import Role from "../models/Role.js";

/**
 * Middleware to check if the user is an admin
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Middleware to check if the user has a specific permission
 */
export const authorizePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate("roles");
      if (!user) return res.status(401).json({ message: "User not found" });

      const permissions = user.roles.flatMap((role) => role.permissions);
      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};
