
import express from "express";

import {
  getPublicServices,
  createService,
  getMyServices,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import {
  protect,
  allowRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public active-service directory
router.get("/", getPublicServices);

// Provider management routes require provider login
router.use(protect, allowRoles("provider"));

// Add new service
router.post("/", createService);

// Get provider's services
router.get("/my-services", getMyServices);

// Update service
router.put("/:id", updateService);

// Delete service
router.delete("/:id", deleteService);

export default router;
