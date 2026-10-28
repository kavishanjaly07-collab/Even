import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

// Makes a login "ticket" (token) that React will keep after login
function createToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // token works for 7 days
  );
}

// ---------- REGISTER ----------
// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { username, phone, email, password, role } = req.body;

    // 1. Check all fields are filled
    if (!username || !phone || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    // 2. Check the user does not already exist
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(400).json({ message: "Username or email already used." });
    }

    // 3. Encrypt the password (never save the real password!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save the user. Only "customer" or "provider" is allowed from the website.
    //    "admin" must be set manually in the database.
    const user = await User.create({
      username,
      phone,
      email,
      password: hashedPassword,
      role: role === "provider" ? "provider" : "customer",
    });

    // 5. Send back the token + safe user info (no password)
    res.status(201).json({
      token: createToken(user),
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ---------- LOGIN ----------
// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Enter your user name and password." });
    }

    // 1. Find the user
    const user = await User.findOne({ username });

    // 2. Compare the typed password with the encrypted one
    //    (same message for both errors, so hackers can't guess which was wrong)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Wrong user name or password." });
    }

    res.json({
      token: createToken(user),
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ---------- GET MY PROFILE ----------
// GET /api/auth/me  (needs login, see authMiddleware.js)
export const getMe = async (req, res) => {
  // req.user was added by the protect middleware
  res.json(req.user);
};
