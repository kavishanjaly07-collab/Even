
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Check whether the user is logged in
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // Check Authorization header
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please log in first.",
      });
    }

    // Extract token
    const token = header.split(" ")[1];

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user without password
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        message: "User no longer exists.",
      });
    }

    // Continue to the requested route
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

// Check user role permissions
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not allowed here.",
      });
    }

    next();
  };
};

