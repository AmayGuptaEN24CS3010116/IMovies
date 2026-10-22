import { Router } from "express";
import Payment from "../models/Payment.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/my", requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 30));
    const [payments, total] = await Promise.all([
      Payment.find({ user: req.user._id }).populate("booking", "bookingCode status showDate showTime").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Payment.countDocuments({ user: req.user._id })
    ]);
    res.json({ payments, pagination: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) { next(error); }
});
export default router;
