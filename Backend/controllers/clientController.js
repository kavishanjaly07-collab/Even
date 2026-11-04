import mongoose from "mongoose";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

const editableProfileFields = ["username", "email", "phone"];
const bookingStatuses = ["Pending", "Accepted", "Rejected"];

function serializeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const getClientProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("_id username email phone role createdAt")
      .lean();

    if (!user || user.role !== "customer") {
      return res.status(404).json({ message: "Client profile not found." });
    }

    return res.status(200).json({ user: serializeUser(user) });
  } catch (error) {
    console.error("Get Client Profile Error:", error.message);
    return res.status(500).json({ message: "Failed to get client profile." });
  }
};

export const updateClientProfile = async (req, res) => {
  try {
    const body = req.body || {};
    const unsupportedFields = Object.keys(body).filter(
      (field) => !editableProfileFields.includes(field)
    );

    if (unsupportedFields.length) {
      return res.status(400).json({
        message: "Only username, email, and phone can be updated.",
      });
    }

    const updates = {};
    for (const field of editableProfileFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") {
          return res.status(400).json({ message: `${field} must be text.` });
        }
        updates[field] = body[field].trim();
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No profile fields were provided." });
    }

    if (updates.username !== undefined && !updates.username) {
      return res.status(400).json({ message: "Username cannot be empty." });
    }
    if (updates.username && updates.username.length > 80) {
      return res.status(400).json({ message: "Username is too long." });
    }

    if (updates.email !== undefined) {
      updates.email = updates.email.toLowerCase();
      if (
        updates.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)
      ) {
        return res.status(400).json({ message: "Enter a valid email address." });
      }
    }

    if (updates.phone !== undefined && !updates.phone) {
      return res.status(400).json({ message: "Phone number cannot be empty." });
    }
    if (updates.phone && updates.phone.length > 40) {
      return res.status(400).json({ message: "Phone number is too long." });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, role: "customer" },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("_id username email phone role createdAt");

    if (!user) {
      return res.status(404).json({ message: "Client profile not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Update Client Profile Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "That username or email address is already in use.",
      });
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: "Profile information is invalid." });
    }

    return res.status(500).json({ message: "Failed to update client profile." });
  }
};

export const getClientDashboardOverview = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("_id username email phone role createdAt")
      .lean();

    if (!user || user.role !== "customer") {
      return res.status(404).json({ message: "Client account not found." });
    }

    const [statusCounts, bookings] = await Promise.all([
      Booking.aggregate([
        { $match: { customer: user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Booking.find({ customer: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("eventDate location status createdAt")
        .populate({ path: "service", select: "title category" })
        .populate({ path: "provider", select: "username" })
        .lean(),
    ]);

    const counts = Object.fromEntries(bookingStatuses.map((status) => [status, 0]));
    for (const row of statusCounts) {
      if (Object.hasOwn(counts, row._id)) counts[row._id] = row.count;
    }

    return res.status(200).json({
      user: serializeUser(user),
      bookingStats: {
        total: statusCounts.reduce((total, row) => total + row.count, 0),
        pending: counts.Pending,
        accepted: counts.Accepted,
        rejected: counts.Rejected,
      },
      supportedBookingStatuses: bookingStatuses,
      recentBookings: bookings,
    });
  } catch (error) {
    console.error("Get Client Dashboard Overview Error:", error.message);
    return res.status(500).json({ message: "Failed to load dashboard overview." });
  }
};
