import express from "express";

import {
  getBookingMessages,
  sendBookingMessage,
} from "../controllers/messageController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getBookingMessages);
router.post("/", sendBookingMessage);

export default router;
