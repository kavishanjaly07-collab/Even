import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware = a "security guard" that runs BEFORE your route code.
// Put `protect` on any route that needs a logged-in user.
export const protect = async (req, res, next) => {
  try {
    // React sends the token like this:  Authorization: Bearer <token>
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please log in first." });
    }

    const token = header.split(" ")[1];3

    // Check the token is real and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load the user (without the password) and attach it to the request
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    next(); // everything OK, continue to the real route
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Use AFTER protect to limit a route to certain roles.
// Example: router.get("/admin", protect, allowRoles("admin"), handler)
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You are not allowed here." });
    }
    next();
  };
};
