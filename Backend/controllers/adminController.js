import mongoose from "mongoose";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import ProviderProfile from "../models/ProviderProfile.js";
import Service from "../models/Service.js";

const monthKey = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const monthLabel = (date) =>
  date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });

const asCountMap = (rows) =>
  new Map(rows.map(({ _id, count }) => [_id, count]));

const serviceStatuses = ["Active", "Draft", "Paused"];
const serviceStringFields = ["title", "category", "description", "priceUnit", "image"];
const bookingStatuses = ["Pending", "Accepted", "Rejected"];

export const getPlatformSettingsStatus = async (req, res) => {
  return res.status(200).json({
    success: true,
    available: false,
    settings: null,
    message: "No database-backed platform settings are configured.",
  });
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function validateServiceInput(body, { creating = false } = {}) {
  const updates = {};

  for (const field of serviceStringFields) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== "string") {
      return { error: `${field} must be text.` };
    }
    const value = body[field].trim();
    if (["title", "category"].includes(field) && !value) {
      return { error: `${field} cannot be empty.` };
    }
    updates[field] = value;
  }

  if (creating && (!updates.title || !updates.category)) {
    return { error: "Title and category are required." };
  }

  if (body.price !== undefined) {
    if (
      body.price === "" ||
      !Number.isFinite(Number(body.price)) ||
      Number(body.price) < 0
    ) {
      return { error: "Please enter a valid price." };
    }
    updates.price = Number(body.price);
  } else if (creating) {
    return { error: "A valid price is required." };
  }

  if (body.status !== undefined) {
    if (!serviceStatuses.includes(body.status)) {
      return { error: "Status must be Active, Draft or Paused." };
    }
    updates.status = body.status;
  }

  return { updates };
}

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Admin get users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const getProviders = async (req, res) => {
  try {
    const users = await User.find({ role: "provider" })
      .select("username email phone createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const userIds = users.map(({ _id }) => _id);

    const [profiles, services] = await Promise.all([
      ProviderProfile.find({ user: { $in: userIds } })
        .select("user businessName businessCategory businessDescription businessPhone businessEmail location businessAddress website")
        .lean(),
      Service.find({ provider: { $in: userIds } })
        .select("provider title category price priceUnit status createdAt")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const profilesByUserId = new Map(
      profiles.map((profile) => [profile.user.toString(), profile])
    );
    const servicesByProviderId = new Map();

    for (const service of services) {
      const providerId = service.provider.toString();
      const providerServices = servicesByProviderId.get(providerId) || [];
      providerServices.push({
        _id: service._id,
        title: service.title,
        category: service.category,
        price: service.price,
        priceUnit: service.priceUnit,
        status: service.status,
        createdAt: service.createdAt,
      });
      servicesByProviderId.set(providerId, providerServices);
    }

    const providers = users.map((user) => ({
      ...user,
      profile: profilesByUserId.get(user._id.toString()) || null,
      services: servicesByProviderId.get(user._id.toString()) || [],
    }));

    return res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    console.error("Admin get providers error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch providers.",
    });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    const paymentCollection = mongoose.connection.db.collection("payments");
    const count = await paymentCollection.countDocuments();

    if (count > 0) {
      return res.status(501).json({
        success: false,
        message: "Payment records exist, but a payment schema is not configured.",
      });
    }

    return res.status(200).json({
      success: true,
      count: 0,
      payments: [],
      message: "No payment records found.",
      commissionDataAvailable: false,
    });
  } catch (error) {
    console.error("Admin get payments error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to check payment records.",
    });
  }
};

export const getAdminBookings = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ message: "Invalid pagination values." });
    }
    if (status && !bookingStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid booking status." });
    }

    const filter = {};
    if (status) filter.status = status;

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const [users, services] = await Promise.all([
        User.find({
          role: { $in: ["customer", "provider"] },
          $or: [{ username: regex }, { email: regex }, { phone: regex }],
        }).select("_id role"),
        Service.find({ $or: [{ title: regex }, { category: regex }] }).select("_id"),
      ]);
      const searchConditions = [
        { location: regex },
        { customer: { $in: users.filter((user) => user.role === "customer").map((user) => user._id) } },
        { provider: { $in: users.filter((user) => user.role === "provider").map((user) => user._id) } },
        { service: { $in: services.map((service) => service._id) } },
      ];
      if (mongoose.isValidObjectId(search)) searchConditions.push({ _id: search });
      filter.$or = searchConditions;
    }

    const [total, bookings, statusCounts, totalBookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .sort({ eventDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: "customer", select: "username email phone" })
        .populate({ path: "provider", select: "username email phone" })
        .populate({ path: "service", select: "title category price priceUnit" })
        .lean(),
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Booking.countDocuments(),
    ]);

    const counts = asCountMap(statusCounts);
    return res.status(200).json({
      success: true,
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        total: totalBookings,
        pending: counts.get("Pending") || 0,
        accepted: counts.get("Accepted") || 0,
        rejected: counts.get("Rejected") || 0,
      },
      supportedStatuses: bookingStatuses,
    });
  } catch (error) {
    console.error("Admin get bookings error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings.",
    });
  }
};

export const getAdminServices = async (req, res) => {
  try {
    const services = await Service.find()
      .select("provider title category description price priceUnit image status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .populate({ path: "provider", select: "username email phone" })
      .lean();
    const providerIds = services
      .map((service) => service.provider?._id)
      .filter(Boolean);
    const [profiles, bookingCounts] = await Promise.all([
      ProviderProfile.find({ user: { $in: providerIds } })
        .select("user businessName businessCategory location businessAddress")
        .lean(),
      Booking.aggregate([
        { $match: { service: { $in: services.map(({ _id }) => _id) } } },
        { $group: { _id: "$service", count: { $sum: 1 } } },
      ]),
    ]);

    const profilesByUserId = new Map(
      profiles.map((profile) => [profile.user.toString(), profile])
    );
    const bookingsByServiceId = new Map(
      bookingCounts.map(({ _id, count }) => [_id.toString(), count])
    );
    const result = services.map((service) => ({
      ...service,
      provider: service.provider
        ? {
            ...service.provider,
            profile: profilesByUserId.get(service.provider._id.toString()) || null,
          }
        : null,
      bookingCount: bookingsByServiceId.get(service._id.toString()) || 0,
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      services: result,
    });
  } catch (error) {
    console.error("Admin get services error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services.",
    });
  }
};

export const getAdminCategories = async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $group: { _id: "$category", serviceCount: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, name: "$_id", serviceCount: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Admin get categories error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service categories.",
    });
  }
};

export const getServiceCategoryStats = async (req, res) => {
  try {
    const [serviceCount, categoryCounts, statusCounts, bookingCount] = await Promise.all([
      Service.countDocuments(),
      Service.aggregate([
        { $group: { _id: "$category" } },
        { $count: "count" },
      ]),
      Service.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Booking.countDocuments(),
    ]);
    const byStatus = asCountMap(statusCounts);

    return res.status(200).json({
      success: true,
      services: {
        total: serviceCount,
        active: byStatus.get("Active") || 0,
        draft: byStatus.get("Draft") || 0,
        paused: byStatus.get("Paused") || 0,
      },
      categories: { total: categoryCounts[0]?.count || 0 },
      bookings: { total: bookingCount },
    });
  } catch (error) {
    console.error("Admin service/category stats error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service and category statistics.",
    });
  }
};

export const createAdminService = async (req, res) => {
  try {
    const { provider } = req.body || {};
    if (!mongoose.isValidObjectId(provider)) {
      return res.status(400).json({ message: "A valid provider is required." });
    }

    const validation = validateServiceInput(req.body || {}, { creating: true });
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const providerUser = await User.findOne({ _id: provider, role: "provider" })
      .select("_id");
    if (!providerUser) {
      return res.status(400).json({ message: "Selected provider was not found." });
    }

    const service = await Service.create({
      ...validation.updates,
      provider: providerUser._id,
    });
    return res.status(201).json({
      success: true,
      message: "Service created successfully.",
      service,
    });
  } catch (error) {
    console.error("Admin create service error:", error.message);
    return res.status(500).json({ message: "Failed to create service." });
  }
};

export const updateAdminService = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid service ID." });
    }
    const validation = validateServiceInput(req.body || {});
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }
    if (Object.keys(validation.updates).length === 0) {
      return res.status(400).json({ message: "At least one service field is required." });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: validation.updates },
      { new: true, runValidators: true }
    ).lean();
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Service updated successfully.",
      service,
    });
  } catch (error) {
    console.error("Admin update service error:", error.message);
    return res.status(500).json({ message: "Failed to update service." });
  }
};

export const deleteAdminService = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid service ID." });
    }
    const service = await Service.findById(req.params.id).select("_id");
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }
    const hasBookings = await Booking.exists({ service: service._id });
    if (hasBookings) {
      return res.status(409).json({
        message: "This service cannot be deleted because bookings reference it.",
      });
    }

    await service.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error("Admin delete service error:", error.message);
    return res.status(500).json({ message: "Failed to delete service." });
  }
};

export const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const chartStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 9, 1));
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const [
      userRoleCounts,
      bookingStatusCounts,
      totalUsers,
      totalBookings,
      totalServices,
      usersCreatedThisMonth,
      recentUsers,
      recentBookings,
      monthlyUsers,
      monthlyBookings,
    ] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.countDocuments(),
      Booking.countDocuments(),
      Service.countDocuments(),
      User.countDocuments({ createdAt: { $gte: currentMonthStart, $lt: nextMonthStart } }),
      User.find()
        .select("username email role createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Booking.find()
        .select("customer provider service eventDate status createdAt")
        .sort({ createdAt: -1 })
        .limit(8)
        .populate({ path: "customer", select: "username" })
        .populate({ path: "provider", select: "username" })
        .populate({ path: "service", select: "title" })
        .lean(),
      User.aggregate([
        { $match: { createdAt: { $gte: chartStart, $lt: nextMonthStart } } },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "UTC" } },
              role: "$role",
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: chartStart, $lt: nextMonthStart } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "UTC" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const roleCounts = asCountMap(userRoleCounts);
    const bookingCounts = asCountMap(bookingStatusCounts);
    const usersByMonthAndRole = new Map(
      monthlyUsers.map(({ _id, count }) => [`${_id.month}:${_id.role}`, count])
    );
    const bookingsByMonth = asCountMap(monthlyBookings);

    const monthly = Array.from({ length: 10 }, (_, index) => {
      const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 9 + index, 1));
      const key = monthKey(month);
      return {
        key,
        label: monthLabel(month),
        users: ["customer", "provider", "admin"].reduce(
          (total, role) => total + (usersByMonthAndRole.get(`${key}:${role}`) || 0),
          0
        ),
        providers: usersByMonthAndRole.get(`${key}:provider`) || 0,
        bookings: bookingsByMonth.get(key) || 0,
      };
    });

    return res.status(200).json({
      users: {
        total: totalUsers,
        customers: roleCounts.get("customer") || 0,
        providers: roleCounts.get("provider") || 0,
        administrators: roleCounts.get("admin") || 0,
      },
      bookings: {
        total: totalBookings,
        pending: bookingCounts.get("Pending") || 0,
        confirmed: bookingCounts.get("Accepted") || 0,
        rejected: bookingCounts.get("Rejected") || 0,
        completed: null,
        cancelled: null,
      },
      services: { total: totalServices },
      recentUsers,
      recentBookings,
      monthly,
      platformActivities: null,
      payments: null,
      generatedAt: now.toISOString(),
      usersCreatedThisMonth,
    });
  } catch (error) {
    console.error("Admin overview error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch admin overview.",
    });
  }
};