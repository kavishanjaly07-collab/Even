import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Message from "../models/Message.js";

const findParticipantBooking = async (bookingId, userId) => {
  if (!mongoose.isValidObjectId(bookingId)) {
    return { error: "Invalid booking ID.", status: 400 };
  }

  const booking = await Booking.findById(bookingId).select("customer provider");
  if (!booking) {
    return { error: "Booking not found.", status: 404 };
  }

  if (
    booking.customer.toString() !== userId.toString() &&
    booking.provider.toString() !== userId.toString()
  ) {
    return { error: "You are not a participant in this booking.", status: 403 };
  }

  return { booking };
};

export const getBookingMessages = async (req, res) => {
  try {
    const result = await findParticipantBooking(req.query.bookingId, req.user._id);
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    const messages = await Message.find({ booking: result.booking._id })
      .sort({ createdAt: 1, _id: 1 })
      .populate({ path: "sender", select: "username role" })
      .lean();

    return res.status(200).json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get Booking Messages Error:", error.message);
    return res.status(500).json({
      message: "Failed to get booking messages.",
    });
  }
};

export const sendBookingMessage = async (req, res) => {
  try {
    const { bookingId, message: messageContent } = req.body || {};
    const result = await findParticipantBooking(bookingId, req.user._id);
    if (result.error) {
      return res.status(result.status).json({ message: result.error });
    }

    if (typeof messageContent !== "string" || !messageContent.trim()) {
      return res.status(400).json({
        message: "Message content is required.",
      });
    }

    const createdMessage = await Message.create({
      booking: result.booking._id,
      sender: req.user._id,
      message: messageContent.trim(),
    });

    const populatedMessage = await Message.findById(createdMessage._id)
      .populate({ path: "sender", select: "username role" })
      .lean();

    return res.status(201).json({
      message: "Message sent successfully.",
      messageRecord: populatedMessage,
    });
  } catch (error) {
    console.error("Send Booking Message Error:", error.message);
    return res.status(500).json({
      message: "Failed to send booking message.",
    });
  }
};
