
import mongoose from "mongoose";
import Service from "../models/Service.js";
import ProviderProfile from "../models/ProviderProfile.js";
import Subscription from "../models/Subscription.js";

const FREE_SERVICE_LIMIT = 5;

async function getProviderSubscription(providerId) {
  const now = new Date();
  const subscriptions = await Subscription.find({ provider: providerId })
    .sort({ startsAt: -1, createdAt: -1 })
    .lean();
  const activeSubscription = subscriptions.find(
    (subscription) =>
      subscription.paymentStatus === "verified" &&
      subscription.startsAt <= now &&
      subscription.expiresAt > now
  );
  const latestSubscription = activeSubscription || subscriptions[0] || null;
  const status = activeSubscription
    ? "Subscribed"
    : subscriptions.some(
        (subscription) =>
          subscription.paymentStatus === "verified" &&
          subscription.expiresAt <= now
      )
      ? "Expired"
      : "Not Subscribed";

  return {
    status,
    planName: latestSubscription?.planName || null,
    startsAt: latestSubscription?.startsAt || null,
    expiresAt: latestSubscription?.expiresAt || null,
    amount: latestSubscription?.amount ?? null,
    currency: latestSubscription?.currency || null,
    serviceLimit: activeSubscription?.serviceLimit ?? null,
  };
}

export const getProviderServiceStatus = async (req, res) => {
  try {
    const [serviceCount, subscription] = await Promise.all([
      Service.countDocuments({ provider: req.user._id }),
      getProviderSubscription(req.user._id),
    ]);

    return res.status(200).json({
      providerId: req.user._id,
      serviceCount,
      freeServiceLimit: FREE_SERVICE_LIMIT,
      remainingFreeServices: Math.max(0, FREE_SERVICE_LIMIT - serviceCount),
      maxServiceCount:
        subscription.status === "Subscribed"
          ? Math.max(FREE_SERVICE_LIMIT, subscription.serviceLimit || FREE_SERVICE_LIMIT)
          : FREE_SERVICE_LIMIT,
      subscription,
    });
  } catch (error) {
    console.error("Get Provider Service Status Error:", error.message);
    return res.status(500).json({
      message: "Failed to get provider service and subscription status.",
    });
  }
};

// GET ACTIVE SERVICES FOR THE PUBLIC DIRECTORY
export const getPublicServices = async (req, res) => {
  try {
    const services = await Service.find({ status: "Active" })
      .select("title category description price priceUnit image status createdAt")
      .sort({ createdAt: -1 })
      .populate({ path: "provider", select: "_id" })
      .lean();

    const providerIds = services
      .map((service) => service.provider?._id)
      .filter(Boolean);
    const profiles = await ProviderProfile.find({ user: { $in: providerIds } })
      .select("user businessName businessCategory businessDescription location logo -_id")
      .lean();
    const profilesByUserId = new Map(
      profiles.map((profile) => [profile.user.toString(), profile])
    );

    const publicServices = services.map((service) => {
      const { provider, ...publicService } = service;
      const profile = provider
        ? profilesByUserId.get(provider._id.toString())
        : null;

      return {
        ...publicService,
        provider: profile
          ? {
              businessName: profile.businessName,
              businessCategory: profile.businessCategory,
              businessDescription: profile.businessDescription,
              location: profile.location,
              logo: profile.logo,
            }
          : null,
      };
    });

    return res.status(200).json({
      count: publicServices.length,
      services: publicServices,
    });
  } catch (error) {
    console.error("Get Public Services Error:", error.message);
    return res.status(500).json({
      message: "Failed to get public services.",
    });
  }
};

// CREATE SERVICE
export const createService = async (req, res) => {
  try {
    const { title, category, description, price, priceUnit, image } = req.body;

    if (!title || !category || price === undefined || price === "") {
      return res.status(400).json({
        message: "Title, category and price are required.",
      });
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        message: "Please enter a valid price.",
      });
    }

    const [serviceCount, subscription] = await Promise.all([
      Service.countDocuments({ provider: req.user._id }),
      getProviderSubscription(req.user._id),
    ]);
    const maxServiceCount =
      subscription.status === "Subscribed"
        ? Math.max(FREE_SERVICE_LIMIT, subscription.serviceLimit || FREE_SERVICE_LIMIT)
        : FREE_SERVICE_LIMIT;
    if (serviceCount >= maxServiceCount) {
      return res.status(403).json({
        code:
          subscription.status === "Subscribed"
            ? "SUBSCRIPTION_SERVICE_LIMIT_REACHED"
            : "FREE_SERVICE_LIMIT_REACHED",
        message:
          subscription.status === "Subscribed"
            ? "You have reached the service limit configured for your subscription plan."
            : "You have reached your free service limit (5/5).",
      });
    }

    const service = await Service.create({
      provider: req.user._id,
      title,
      category,
      description,
      price: Number(price),
      priceUnit,
      image,
      status: "Draft",
    });

    return res.status(201).json({
      message: "Service created successfully.",
      service,
    });

  } catch (error) {
    console.error("Create Service Error:", error.message);

    return res.status(500).json({
      message: "Failed to create service.",
    });
  }
};

// GET PROVIDER'S SERVICES
export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({
      provider: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: services.length,
      services,
    });

  } catch (error) {
    console.error("Get Services Error:", error.message);

    return res.status(500).json({
      message: "Failed to get services.",
    });
  }
};

export const getMyService = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid service ID." });
    }

    const service = await Service.findOne({
      _id: req.params.id,
      provider: req.user._id,
    }).lean();

    if (!service) {
      return res.status(404).json({
        message: "Service not found or access denied.",
      });
    }

    return res.status(200).json({ service });
  } catch (error) {
    console.error("Get Provider Service Error:", error.message);
    return res.status(500).json({ message: "Failed to get service." });
  }
};

// UPDATE SERVICE
export const updateService = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid service ID.",
      });
    }

    const allowedFields = [
      "title",
      "category",
      "description",
      "price",
      "priceUnit",
      "image",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.status === "Active") {
      return res.status(403).json({
        message: "Publish this service using its Publish action.",
      });
    }

    if (updates.status && updates.status !== "Paused" && updates.status !== "Draft") {
      return res.status(400).json({ message: "Invalid service status." });
    }

    if (updates.price !== undefined) {
      if (
        updates.price === "" ||
        !Number.isFinite(Number(updates.price)) ||
        Number(updates.price) < 0
      ) {
        return res.status(400).json({
          message: "Please enter a valid price.",
        });
      }

      updates.price = Number(updates.price);
    }

    const service = await Service.findOneAndUpdate(
      {
        _id: req.params.id,
        provider: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        message: "Service not found or access denied.",
      });
    }

    return res.status(200).json({
      message: "Service updated successfully.",
      service,
    });

  } catch (error) {
    console.error("Update Service Error:", error.message);

    return res.status(500).json({
      message: "Failed to update service.",
    });
  }
};

export const publishService = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid service ID." });
    }

    const service = await Service.findOne({
      _id: req.params.id,
      provider: req.user._id,
    });
    if (!service) {
      return res.status(404).json({
        message: "Service not found or access denied.",
      });
    }

    const subscription = await getProviderSubscription(req.user._id);
    if (subscription.status !== "Subscribed") {
      return res.status(402).json({
        code: subscription.status === "Expired" ? "SUBSCRIPTION_EXPIRED" : "SUBSCRIPTION_REQUIRED",
        message:
          subscription.status === "Expired"
            ? "Your subscription has expired. Renew it before publishing this service."
            : "An active subscription is required to publish services.",
        subscription,
      });
    }

    service.status = "Active";
    await service.save();

    return res.status(200).json({
      message: "Service published successfully.",
      service,
    });
  } catch (error) {
    console.error("Publish Service Error:", error.message);
    return res.status(500).json({ message: "Failed to publish service." });
  }
};

// DELETE SERVICE
export const deleteService = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid service ID.",
      });
    }

    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      provider: req.user._id,
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found or access denied.",
      });
    }

    return res.status(200).json({
      message: "Service deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Service Error:", error.message);

    return res.status(500).json({
      message: "Failed to delete service.",
    });
  }
};
