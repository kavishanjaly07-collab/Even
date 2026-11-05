import express from "express";

import {
  createBooking,
  getMyBookings,
  getProviderRequests,
  updateBookingStatus,
} from "../controllers/bookingController.js";

import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only authenticated customers can create and view their bookings
router.post("/", protect, allowRoles("customer"), createBooking);
router.get("/my-bookings", protect, allowRoles("customer"), getMyBookings);

// Only authenticated providers can view requests and update their status
router.get("/provider-requests", protect, allowRoles("provider"), getProviderRequests);
router.patch("/:id/status", protect, allowRoles("provider"), updateBookingStatus);

export default router;
