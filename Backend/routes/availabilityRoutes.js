
import express from "express";

import {
  getMyAvailability,
  createAvailability,
  deleteAvailability,
  checkProviderAvailability,
} from "../controllers/availabilityController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer and other visitors can check a provider's availability
router.get("/check", checkProviderAvailability);

// Provider-only availability management
router.use(protect, allowRoles("provider"));

router.get("/my", getMyAvailability);

router.post("/", createAvailability);

router.delete("/:id", deleteAvailability);

export default router;
