
import express from "express";

import {
  createProviderProfile,
  getMyProviderProfile,
  updateProviderProfile,
} from "../controllers/providerProfileController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only authenticated providers can access these routes
router.use(protect, allowRoles("provider"));

// Registration creates a provider profile before redirecting to the dashboard.
router.post("/", createProviderProfile);

// Get My Provider Profile
router.get("/my-profile", getMyProviderProfile);

// Update Provider Profile
router.put("/my-profile", updateProviderProfile);

export default router;
