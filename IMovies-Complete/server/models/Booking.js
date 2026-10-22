import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", default: null },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: "Theatre", default: null },
  showDate: { type: String, required: true },
  showTime: { type: String, required: true },
  seats: [{ type: String, required: true }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  paymentStatus: { type: String, enum: ["simulated_success", "simulated_refund", "not_applicable"], default: "simulated_success" },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  cancellationReason: { type: String, maxlength: 240, default: "" },
  cancelledAt: { type: Date, default: null },
  bookingCode: { type: String, required: true, unique: true }
}, { timestamps: true });

bookingSchema.index({ movie: 1, showDate: 1, showTime: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ show: 1, status: 1 });
export default mongoose.model("Booking", bookingSchema);
