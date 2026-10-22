import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  showDate: { type: String, required: true },
  showTime: { type: String, required: true },
  seats: [{ type: String, required: true }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  bookingCode: { type: String, required: true, unique: true }
}, { timestamps: true });

bookingSchema.index({ movie: 1, showDate: 1, showTime: 1, status: 1 });
export default mongoose.model("Booking", bookingSchema);
