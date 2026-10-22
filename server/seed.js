import mongoose from "mongoose";
import dotenv from "dotenv";
import { ensureDemoData } from "./bootstrapData.js";

dotenv.config();
try {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/imovies");
  await ensureDemoData();
  console.log("Demo data is ready. Existing records were preserved.");
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
