import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

class SetupError extends Error {}

const username = process.env.ADMIN_USERNAME?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const phone = process.env.ADMIN_PHONE?.trim();
const password = process.env.ADMIN_PASSWORD;

async function setupAdmin() {
  if (!username || !email || !phone || !password) {
    throw new SetupError(
      "Set ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD before setup."
    );
  }

  if (password.length < 12) {
    throw new SetupError("ADMIN_PASSWORD must be at least 12 characters.");
  }

  await connectDB();

  if (await User.exists({ role: "admin" })) {
    throw new SetupError("An admin account already exists; initial setup is one-time.");
  }

  if (await User.exists({ $or: [{ username }, { email }] })) {
    throw new SetupError("The configured username or email is already in use.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    username,
    email,
    phone,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Initial admin account created. Sign in through the Admin Login page.");
}

setupAdmin()
  .catch((error) => {
    if (error instanceof SetupError) {
      console.error(error.message);
    } else {
      console.error("Initial admin setup failed. Check the database and environment configuration.");
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      console.error("Could not close the database connection cleanly.");
      process.exitCode = 1;
    }
  });
