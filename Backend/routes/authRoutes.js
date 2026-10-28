import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Full addresses (server.js adds the /api/auth part):
router.post("/register", register); // POST /api/auth/register
router.post("/login", login); //       POST /api/auth/login
router.get("/me", protect, getMe); //   GET  /api/auth/me  (login required)

export default router;
