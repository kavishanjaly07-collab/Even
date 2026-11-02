
import mongoose from "mongoose";
import ProviderProfile from "../models/ProviderProfile.js";

// Create Provider Profile
export const createProviderProfile = async (req, res) => {
  try {
    const {
      businessName,
      businessCategory,
      businessDescription,
      businessPhone,
      businessEmail,
      location,
      businessAddress,
      website,
      logo,
    } = req.body;

    if (!businessName || !businessCategory) {
      return res.status(400).json({
        message: "Business name and category are required.",
      });
    }

    const existingProfile = await ProviderProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(409).json({
        message: "Provider profile already exists.",
      });
    }

    const profile = await ProviderProfile.create({
      user: req.user._id,
      businessName,
      businessCategory,
      businessDescription,
      businessPhone,
      businessEmail,
      location,
      businessAddress,
      website,
      logo,
    });

    return res.status(201).json({
      message: "Provider profile created successfully.",
      profile,
    });
  } catch (error) {
    console.error("Create Provider Profile Error:", error.message);

    return res.status(500).json({
      message: "Failed to create provider profile.",
    });
  }
};

// Get My Provider Profile
export const getMyProviderProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Provider profile not found.",
      });
    }

    return res.status(200).json({
      profile,
    });
  } catch (error) {
    console.error("Get Provider Profile Error:", error.message);

    return res.status(500).json({
      message: "Failed to get provider profile.",
    });
  }
};

// Update Provider Profile
export const updateProviderProfile = async (req, res) => {
  try {
    const allowedFields = [
      "businessName",
      "businessCategory",
      "businessDescription",
      "businessPhone",
      "businessEmail",
      "location",
      "businessAddress",
      "website",
      "logo",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.businessName !== undefined &&
      !updates.businessName.trim()
    ) {
      return res.status(400).json({
        message: "Business name cannot be empty.",
      });
    }

    if (
      updates.businessCategory !== undefined &&
      !updates.businessCategory.trim()
    ) {
      return res.status(400).json({
        message: "Business category cannot be empty.",
      });
    }

    if (updates.businessEmail !== undefined) {
      updates.businessEmail = updates.businessEmail.trim().toLowerCase();
    }

    const profile = await ProviderProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profile) {
      return res.status(404).json({
        message: "Provider profile not found. Create it first.",
      });
    }

    return res.status(200).json({
      message: "Provider profile updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Update Provider Profile Error:", error.message);

    return res.status(500).json({
      message: "Failed to update provider profile.",
    });
  }
};
