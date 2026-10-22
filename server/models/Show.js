import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: "Theatre", required: true },
  screenName: { type: String, required: true, trim: true, default: "Screen 1" },
  showDate: { type: String, required: true }, // ISO calendar date, YYYY-MM-DD
  showTime: { type: String, required: true, trim: true },
  language: { type: String, default: "English", trim: true },
  price: { type: Number, required: true, min: 1 },
  seatRows: { type: Number, default: 6, min: 1, max: 12 },
  seatsPerRow: { type: Number, default: 8, min: 1, max: 20 },
  status: { type: String, enum: ["scheduled", "cancelled"], default: "scheduled" }
}, { timestamps: true });

showSchema.index({ movie: 1, showDate: 1, showTime: 1 });
showSchema.index({ theatre: 1, showDate: 1, showTime: 1, screenName: 1 }, { unique: true });
export default mongoose.model("Show", showSchema);
