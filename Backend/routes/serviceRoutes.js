
import express from "express";

import {
  getPublicServices,
  createService,
  getMyService,
  getMyServices,
  getProviderServiceStatus,
  publishService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public active-service directory
router.get("/", getPublicServices);

// Provider management routes require provider login
router.use(protect, allowRoles("provider"));

router.get("/provider-status", getProviderServiceStatus);

// Add new service
router.post("/", createService);

// Get provider's services
router.get("/my-services", getMyServices);

// Retrieve an individual service owned by the authenticated provider
router.get("/:id", getMyService);
router.post("/:id/publish", publishService);

// Update service
router.put("/:id", updateService);

// Delete service
router.delete("/:id", deleteService);

export default router;
