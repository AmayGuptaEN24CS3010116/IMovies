import { Router } from "express";
import mongoose from "mongoose";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Theatre from "../models/Theatre.js";
import { pagination, paginationMeta } from "../lib/seatUtils.js";

const router = Router();
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = {};
    if (req.query.search?.trim()) filter.title = { $regex: req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (req.query.genre && req.query.genre !== "All") filter.genre = req.query.genre;
    if (req.query.language) filter.language = req.query.language;
    if (req.query.city?.trim()) {
      const theatres = await Theatre.find({ active: true, city: { $regex: req.query.city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }).select("_id");
      const movieIds = await Show.distinct("movie", { theatre: { $in: theatres.map(t => t._id) }, status: "scheduled" });
      filter._id = { $in: movieIds };
    }
    const [movies, total] = await Promise.all([
      Movie.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Movie.countDocuments(filter)
    ]);
    res.json({ movies, pagination: paginationMeta(total, page, limit) });
  } catch (error) { next(error); }
});
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid movie id." });
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    res.json({ movie });
  } catch (error) { next(error); }
});
export default router;
