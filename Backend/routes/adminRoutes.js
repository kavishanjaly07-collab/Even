import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import {
  createAdminService,
  deleteAdminService,
  getAdminCategories,
  getAdminBookings,
  getAdminPayments,
  getAdminServices,
  getAllUsers,
  getOverview,
  getPlatformSettingsStatus,
  getProviders,
  getServiceCategoryStats,
  updateAdminService,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/overview", protect, allowRoles("admin"), getOverview);
router.get("/users", protect, allowRoles("admin"), getAllUsers);
router.get("/providers", protect, allowRoles("admin"), getProviders);
router.get("/bookings", protect, allowRoles("admin"), getAdminBookings);
router.get("/payments", protect, allowRoles("admin"), getAdminPayments);
router.get("/services", protect, allowRoles("admin"), getAdminServices);
router.get("/categories", protect, allowRoles("admin"), getAdminCategories);
router.get("/service-category/stats", protect, allowRoles("admin"), getServiceCategoryStats);
router.get("/settings", protect, allowRoles("admin"), getPlatformSettingsStatus);
router.post("/services", protect, allowRoles("admin"), createAdminService);
router.put("/services/:id", protect, allowRoles("admin"), updateAdminService);
router.delete("/services/:id", protect, allowRoles("admin"), deleteAdminService);

export default router;