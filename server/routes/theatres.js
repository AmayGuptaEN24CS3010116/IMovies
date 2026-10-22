import { Router } from "express";
import Theatre from "../models/Theatre.js";
import Show from "../models/Show.js";
import { pagination, paginationMeta } from "../lib/seatUtils.js";

const router = Router();
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = { active: true };
    if (req.query.city?.trim()) filter.city = { $regex: req.query.city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (req.query.search?.trim()) filter.name = { $regex: req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const [theatres, total] = await Promise.all([Theatre.find(filter).sort({ city: 1, name: 1 }).skip(skip).limit(limit), Theatre.countDocuments(filter)]);
    res.json({ theatres, pagination: paginationMeta(total, page, limit) });
  } catch (error) { next(error); }
});
router.get("/:id", async (req, res, next) => {
  try {
    const theatre = await Theatre.findOne({ _id: req.params.id, active: true });
    if (!theatre) return res.status(404).json({ message: "Theatre not found." });
    res.json({ theatre });
  } catch (error) { next(error); }
});
export default router;
