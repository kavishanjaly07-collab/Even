import express from "express";
import {
  getClientDashboardOverview,
  getClientProfile,
  updateClientProfile,
} from "../controllers/clientController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("customer"));
router.get("/profile", getClientProfile);
router.put("/profile", updateClientProfile);
router.get("/dashboard/overview", getClientDashboardOverview);

export default router;
