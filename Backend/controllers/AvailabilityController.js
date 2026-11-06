
import mongoose from "mongoose";
import ProviderAvailability from "../models/ProviderAvailability.js";
import Booking from "../models/Booking.js";

// Convert a date into a consistent UTC date range
const getDateRange = (date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
};

// GET PROVIDER'S OWN AVAILABILITY
export const getMyAvailability = async (req, res) => {
  try {
    const availability = await ProviderAvailability.find({
      provider: req.user._id,
    }).sort({ startDate: 1 });

    return res.status(200).json({
      count: availability.length,
      availability,
    });
  } catch (error) {
    console.error("Get Availability Error:", error.message);
    return res.status(500).json({
      message: "Failed to get availability.",
    });
  }
};

// CREATE AVAILABLE OR UNAVAILABLE DATES
export const createAvailability = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      startTime,
      endTime,
      reason,
      notes,
    } = req.body || {};

    if (!startDate || !endDate || !type) {
      return res.status(400).json({
        message: "Start date, end date and type are required.",
      });
    }

    if (!["Available", "Unavailable"].includes(type)) {
      return res.status(400).json({
        message: "Type must be Available or Unavailable.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date.",
      });
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    if (end < start) {
      return res.status(400).json({
        message: "End date cannot be before start date.",
      });
    }

    // Do not allow unavailable dates that overlap accepted bookings
    if (type === "Unavailable") {
      const nextDay = new Date(end);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      const existingBooking = await Booking.findOne({
        provider: req.user._id,
        status: "Accepted",
        eventDate: {
          $gte: start,
          $lt: nextDay,
        },
      });

      if (existingBooking) {
        return res.status(409).json({
          message: "These dates contain an accepted booking.",
        });
      }
    }

    // Prevent conflicting availability entries
    const existingEntry = await ProviderAvailability.findOne({
      provider: req.user._id,
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (existingEntry) {
      return res.status(409).json({
        message: "An availability entry already exists for these dates.",
      });
    }

    const availability = await ProviderAvailability.create({
      provider: req.user._id,
      startDate: start,
      endDate: end,
      type,
      startTime: startTime || "09:00",
      endTime: endTime || "17:00",
      reason: reason || "",
      notes: notes || "",
    });

    return res.status(201).json({
      message: `${type} dates saved successfully.`,
      availability,
    });
  } catch (error) {
    console.error("Create Availability Error:", error.message);
    return res.status(500).json({
      message: "Failed to save availability.",
    });
  }
};

// DELETE AN AVAILABILITY ENTRY
export const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid availability ID.",
      });
    }

    const availability = await ProviderAvailability.findOneAndDelete({
      _id: id,
      provider: req.user._id,
    });

    if (!availability) {
      return res.status(404).json({
        message: "Availability entry not found.",
      });
    }

    return res.status(200).json({
      message: "Availability entry deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Availability Error:", error.message);
    return res.status(500).json({
      message: "Failed to delete availability.",
    });
  }
};

// CHECK A PROVIDER'S AVAILABILITY FOR A SELECTED DATE
export const checkProviderAvailability = async (req, res) => {
  try {
    const { providerId, date } = req.query;

    if (!providerId || !date) {
      return res.status(400).json({
        message: "Provider ID and date are required.",
      });
    }

    if (!mongoose.isValidObjectId(providerId)) {
      return res.status(400).json({
        message: "Invalid provider ID.",
      });
    }

    const { start, end } = getDateRange(date);

    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        message: "Invalid date.",
      });
    }

    const blockedDate = await ProviderAvailability.findOne({
      provider: providerId,
      type: "Unavailable",
      startDate: { $lt: end },
      endDate: { $gte: start },
    });

    if (blockedDate) {
      return res.status(200).json({
        available: false,
        reason: blockedDate.reason || "Provider has blocked this date.",
      });
    }

    const acceptedBooking = await Booking.findOne({
      provider: providerId,
      status: "Accepted",
      eventDate: { $gte: start, $lt: end },
    });

    if (acceptedBooking) {
      return res.status(200).json({
        available: false,
        reason: "Provider already has an accepted booking on this date.",
      });
    }

    return res.status(200).json({
      available: true,
      reason: "Provider is available on this date.",
    });
  } catch (error) {
    console.error("Check Availability Error:", error.message);
    return res.status(500).json({
      message: "Failed to check provider availability.",
    });
  }
};
