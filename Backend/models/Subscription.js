import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    serviceLimit: {
      type: Number,
      min: 1,
    },
    currency: {
      type: String,
      trim: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
