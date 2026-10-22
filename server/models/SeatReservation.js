import mongoose from "mongoose";

const seatReservationSchema = new mongoose.Schema({
  show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
  seat: { type: String, required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  attemptId: { type: String, default: null }
}, { timestamps: true });

// This unique key is the final guard against two requests reserving the same seat.
seatReservationSchema.index({ show: 1, seat: 1 }, { unique: true });
export default mongoose.model("SeatReservation", seatReservationSchema);
