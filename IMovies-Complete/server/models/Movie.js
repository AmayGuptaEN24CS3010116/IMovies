import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  genre: [{ type: String }],
  duration: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  language: { type: String, default: "English" },
  certificate: { type: String, default: "UA" },
  posterUrl: { type: String, required: true },
  backdropUrl: { type: String, default: "" },
  releaseDate: { type: Date },
  price: { type: Number, default: 180 }
}, { timestamps: true });

export default mongoose.model("Movie", movieSchema);
