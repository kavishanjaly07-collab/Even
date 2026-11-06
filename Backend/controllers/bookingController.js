import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import ProviderAvailability from "../models/ProviderAvailability.js";

// CREATE CUSTOMER BOOKING REQUEST
export const createBooking = async (req, res) => {
  try {
    const { serviceId, eventDate: eventDateInput, location, additionalRequirements } = req.body || {};

    if (!serviceId || !eventDateInput || typeof location !== "string" || !location.trim()) {
      return res.status(400).json({
        message: "Service, event date and location are required.",
      });
    }

    if (!mongoose.isValidObjectId(serviceId)) {
      return res.status(400).json({
        message: "Invalid service ID.",
      });
    }

    if (typeof eventDateInput !== "string" && !(eventDateInput instanceof Date)) {
      return res.status(400).json({
        message: "Please enter a valid event date.",
      });
    }

    const eventDate = new Date(eventDateInput);
    if (Number.isNaN(eventDate.getTime())) {
      return res.status(400).json({
        message: "Please enter a valid event date.",
      });
    }

    if (
      additionalRequirements !== undefined &&
      typeof additionalRequirements !== "string"
    ) {
      return res.status(400).json({
        message: "Additional requirements must be text.",
      });
    }
    const existingBookings = await Booking.countDocuments({
  customer: req.user._id,
});

if (existingBookings >= 5) {
  return res.status(402).json({
    message: "You have used your 5 free bookings. Payment is required for additional bookings.",
    paymentRequired: true,
    totalBookings: existingBookings,
  });
}



    const service = await Service.findOne({
      _id: serviceId,
      status: "Active",
    }).select("_id provider");

    if (!service) {
      return res.status(404).json({
        message: "Active service not found.",
      });
    }


    // CHECK PROVIDER AVAILABILITY
const eventStart = new Date(eventDate);
eventStart.setUTCHours(0, 0, 0, 0);

const eventEnd = new Date(eventStart);
eventEnd.setUTCDate(eventEnd.getUTCDate() + 1);

// CHECK BLOCKED DATE
const blockedDate = await ProviderAvailability.findOne({
  provider: service.provider,
  type: "Unavailable",
  startDate: { $lt: eventEnd },
  endDate: { $gte: eventStart },
});

if (blockedDate) {
  return res.status(409).json({
    message: "This provider is unavailable on your selected event date.",
    available: false,
  });
}


    const booking = await Booking.create({
      customer: req.user._id,
      provider: service.provider,
      service: service._id,
      eventDate,
      location: location.trim(),
      additionalRequirements: additionalRequirements?.trim() || "",
      status: "Pending",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate({ path: "service", select: "title category price priceUnit image" })
      .lean();

    return res.status(201).json({
      message: "Booking request submitted successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error.message);
    return res.status(500).json({
      message: "Failed to create booking request.",
    });
  }
};
// GET CUSTOMER BOOKING USAGE
export const getBookingUsage = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({
      customer: req.user._id,
    });

    return res.status(200).json({
      totalBookings,
      freeBookings: 5,
      remainingFreeBookings: Math.max(0, 5 - totalBookings),
      paymentRequired: totalBookings >= 5,
    });
  } catch (error) {
    console.error("Get Booking Usage Error:", error.message);

    return res.status(500).json({
      message: "Failed to get booking usage.",
    });
  }
};

// GET CUSTOMER'S BOOKINGS
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "service",
        select: "title category price priceUnit image provider",
        populate: { path: "provider", select: "username" },
      })
      .lean();

    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Customer Bookings Error:", error.message);
    return res.status(500).json({
      message: "Failed to get bookings.",
    });
  }
};

// GET BOOKING REQUESTS FOR THIS PROVIDER
export const getProviderRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "customer", select: "username" })
      .populate({ path: "service", select: "title category price priceUnit image" })
      .lean();

    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Provider Booking Requests Error:", error.message);
    return res.status(500).json({
      message: "Failed to get booking requests.",
    });
  }
};

// ACCEPT OR REJECT A PROVIDER'S BOOKING REQUEST

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Accepted or Rejected.",
      });
    }

    const existingBooking = await Booking.findOne({
      _id: id,
      provider: req.user._id,
      status: "Pending",
    });

    if (!existingBooking) {
      return res.status(404).json({
        message: "Pending booking not found or access denied.",
      });
    }

    if (status === "Accepted") {
      const eventStart = new Date(existingBooking.eventDate);
      eventStart.setUTCHours(0, 0, 0, 0);

      const eventEnd = new Date(eventStart);
      eventEnd.setUTCDate(eventEnd.getUTCDate() + 1);

      const conflictingBooking = await Booking.findOne({
        _id: { $ne: existingBooking._id },
        provider: req.user._id,
        status: "Accepted",
        eventDate: {
          $gte: eventStart,
          $lt: eventEnd,
        },
      });

      if (conflictingBooking) {
        return res.status(409).json({
          message: "You already have an accepted booking on this date.",
        });
      }

      const blockedDate = await ProviderAvailability.findOne({
        provider: req.user._id,
        type: "Unavailable",
        startDate: { $lt: eventEnd },
        endDate: { $gte: eventStart },
      });

      if (blockedDate) {
        return res.status(409).json({
          message: "You have marked this date as unavailable.",
        });
      }
    }
    // CHECK EXISTING ACCEPTED BOOKING
const conflictingBooking = await Booking.findOne({
  provider: service.provider,
  status: "Accepted",
  eventDate: {
    $gte: eventStart,
    $lt: eventEnd,
  },
});

if (conflictingBooking) {
  return res.status(409).json({
    message: "This provider already has an accepted booking on your selected event date.",
    available: false,
  });
}

    const booking = await Booking.findOneAndUpdate(
      {
        _id: id,
        provider: req.user._id,
        status: "Pending",
      },
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({ path: "customer", select: "username" })
      .populate({
        path: "service",
        select: "title category price priceUnit image",
      })
      .lean();

    if (!booking) {
      return res.status(409).json({
        message: "Booking status has already changed. Please refresh.",
      });
    }

    return res.status(200).json({
      message: `Booking ${status.toLowerCase()} successfully.`,
      booking,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error.message);

    return res.status(500).json({
      message: "Failed to update booking status.",
    });
  }
};
