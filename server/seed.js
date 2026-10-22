import mongoose from "mongoose";
import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import Movie from "./models/Movie.js";

dotenv.config();
const dataUrl = new URL("./data/movies.json", import.meta.url);

try {
  const raw = await readFile(dataUrl, "utf8");
  const movies = JSON.parse(raw);
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/imovies");
  // WARNING: this intentionally replaces the entire movie catalogue in the selected database.
  await Movie.deleteMany({});
  await Movie.insertMany(movies);
  console.log(`Seeded ${movies.length} movies from server/data/movies.json.`);
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}
