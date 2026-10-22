import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  address: { type: String, required: true, trim: true, maxlength: 240 },
  screens: { type: Number, required: true, min: 1, max: 40, default: 1 },
  facilities: [{ type: String, trim: true }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

theatreSchema.index({ city: 1, active: 1, name: 1 });
export default mongoose.model("Theatre", theatreSchema);
