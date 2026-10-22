import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "INR" },
  method: { type: String, enum: ["DEMO"], default: "DEMO" },
  status: { type: String, enum: ["simulated_success", "simulated_refund", "cancelled"], default: "simulated_success" },
  reference: { type: String, required: true, unique: true },
  note: { type: String, default: "Simulated payment for student demonstration; no money was charged." }
}, { timestamps: true });

paymentSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model("Payment", paymentSchema);
