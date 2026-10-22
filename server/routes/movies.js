import { Router } from "express";
import Movie from "../models/Movie.js";

const router = Router();
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };
    if (req.query.genre) filter.genre = req.query.genre;
    const movies = await Movie.find(filter).sort({ createdAt: -1 });
    res.json({ movies });
  } catch (error) { next(error); }
});
router.get("/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    res.json({ movie });
  } catch (error) { next(error); }
});
export default router;
