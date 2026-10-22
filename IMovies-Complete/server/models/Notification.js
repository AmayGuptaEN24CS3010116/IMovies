import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxlength: 120 },
  message: { type: String, required: true, maxlength: 500 },
  type: { type: String, enum: ["booking", "cancellation", "payment", "system"], default: "system" },
  readAt: { type: Date, default: null },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null }
}, { timestamps: true });

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });
export default mongoose.model("Notification", notificationSchema);
