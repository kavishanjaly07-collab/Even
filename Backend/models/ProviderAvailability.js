
import mongoose from "mongoose";

const providerAvailabilitySchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["Available", "Unavailable"],
      required: true,
    },

    startTime: {
      type: String,
      default: "09:00",
    },

    endTime: {
      type: String,
      default: "17:00",
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

providerAvailabilitySchema.index({
  provider: 1,
  startDate: 1,
  endDate: 1,
});

const ProviderAvailability = mongoose.model(
  "ProviderAvailability",
  providerAvailabilitySchema
);

export default ProviderAvailability;
