import mongoose from "mongoose";

// A "schema" describes what one user looks like in the database
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // no two users can have the same username
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // this will be saved ENCRYPTED, never plain text
    },
    // Matches your navbar: Customer Portal / Provider Hub / Admin Suite
    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

export default mongoose.model("User", userSchema);
