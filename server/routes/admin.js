import { Router } from "express";
import mongoose from "mongoose";
import Movie from "../models/Movie.js";
import Theatre from "../models/Theatre.js";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { pagination, paginationMeta } from "../lib/seatUtils.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/stats", async (_req, res, next) => {
  try {
    const [movies, theatres, shows, bookings, users, revenueResult] = await Promise.all([
      Movie.countDocuments(), Theatre.countDocuments({ active: true }), Show.countDocuments({ status: "scheduled" }),
      Booking.countDocuments(), User.countDocuments(),
      Booking.aggregate([{ $match: { status: "confirmed" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }])
    ]);
    res.json({ stats: { movies, theatres, shows, bookings, users, demoRevenue: revenueResult[0]?.total || 0 } });
  } catch (error) { next(error); }
});

router.get("/movies", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const [movies, total] = await Promise.all([Movie.find().sort({ createdAt: -1 }).skip(skip).limit(limit), Movie.countDocuments()]);
    res.json({ movies, pagination: paginationMeta(total, page, limit) });
  } catch (error) { next(error); }
});
router.post("/movies", async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.title?.trim() || !body.description?.trim() || !body.posterUrl?.trim()) return res.status(400).json({ message: "Title, description and poster URL are required." });
    const movie = await Movie.create({ ...body, title: body.title.trim(), genre: Array.isArray(body.genre) ? body.genre : String(body.genre || "Drama").split(",").map(s => s.trim()).filter(Boolean), duration: Number(body.duration), price: Number(body.price), rating: Number(body.rating || 0) });
    res.status(201).json({ movie });
  } catch (error) { next(error); }
});
router.put("/movies/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid movie id." });
    const body = { ...req.body };
    if (body.genre && !Array.isArray(body.genre)) body.genre = String(body.genre).split(",").map(s => s.trim()).filter(Boolean);
    if (body.duration !== undefined) body.duration = Number(body.duration);
    if (body.price !== undefined) body.price = Number(body.price);
    if (body.rating !== undefined) body.rating = Number(body.rating);
    const movie = await Movie.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    res.json({ movie });
  } catch (error) { next(error); }
});
router.delete("/movies/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid movie id." });
    const [bookingExists, showExists] = await Promise.all([Booking.exists({ movie: req.params.id }), Show.exists({ movie: req.params.id })]);
    if (bookingExists || showExists) return res.status(409).json({ message: "This movie is linked to bookings or shows. Deactivate it or remove linked future shows first." });
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    res.json({ message: "Movie deleted." });
  } catch (error) { next(error); }
});

router.get("/theatres", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const [theatres, total] = await Promise.all([Theatre.find().sort({ createdAt: -1 }).skip(skip).limit(limit), Theatre.countDocuments()]);
    res.json({ theatres, pagination: paginationMeta(total, page, limit) });
  } catch (error) { next(error); }
});
router.post("/theatres", async (req, res, next) => {
  try {
    const { name, city, address } = req.body;
    if (!name?.trim() || !city?.trim() || !address?.trim()) return res.status(400).json({ message: "Theatre name, city and address are required." });
    const theatre = await Theatre.create({ ...req.body, name: name.trim(), city: city.trim(), address: address.trim(), screens: Number(req.body.screens || 1), facilities: Array.isArray(req.body.facilities) ? req.body.facilities : String(req.body.facilities || "").split(",").map(s => s.trim()).filter(Boolean) });
    res.status(201).json({ theatre });
  } catch (error) { next(error); }
});
router.put("/theatres/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid theatre id." });
    const body = { ...req.body };
    if (body.screens !== undefined) body.screens = Number(body.screens);
    if (body.facilities && !Array.isArray(body.facilities)) body.facilities = String(body.facilities).split(",").map(s => s.trim()).filter(Boolean);
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!theatre) return res.status(404).json({ message: "Theatre not found." });
    res.json({ theatre });
  } catch (error) { next(error); }
});
router.delete("/theatres/:id", async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!theatre) return res.status(404).json({ message: "Theatre not found." });
    res.json({ message: "Theatre deactivated. Historical show records are preserved." });
  } catch (error) { next(error); }
});

router.get("/shows", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const [shows, total] = await Promise.all([Show.find().populate("movie", "title posterUrl").populate("theatre", "name city").sort({ showDate: 1, showTime: 1 }).skip(skip).limit(limit), Show.countDocuments()]);
    res.json({ shows, pagination: paginationMeta(total, page, limit) });
  } catch (error) { next(error); }
});
router.post("/shows", async (req, res, next) => {
  try {
    const { movieId, theatreId, showDate, showTime, screenName } = req.body;
    if (![movieId, theatreId].every(mongoose.isValidObjectId) || !showDate || !showTime) return res.status(400).json({ message: "Movie, theatre, date and showtime are required." });
    const [movie, theatre] = await Promise.all([Movie.findById(movieId), Theatre.findOne({ _id: theatreId, active: true })]);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    if (!theatre) return res.status(404).json({ message: "Active theatre not found." });
    const show = await Show.create({ movie: movieId, theatre: theatreId, showDate, showTime, screenName: screenName || "Screen 1", language: req.body.language || movie.language, price: Number(req.body.price || movie.price), seatRows: Number(req.body.seatRows || 6), seatsPerRow: Number(req.body.seatsPerRow || 8) });
    await show.populate(["movie", "theatre"]);
    res.status(201).json({ show });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "A show may already exist for this theatre, date and time." });
    next(error);
  }
});
router.put("/shows/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid show id." });
    const body = { ...req.body };
    if (body.price !== undefined) body.price = Number(body.price);
    if (body.seatRows !== undefined) body.seatRows = Number(body.seatRows);
    if (body.seatsPerRow !== undefined) body.seatsPerRow = Number(body.seatsPerRow);
    if (body.movieId) { body.movie = body.movieId; delete body.movieId; }
    if (body.theatreId) { body.theatre = body.theatreId; delete body.theatreId; }
    const show = await Show.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true }).populate("movie", "title posterUrl").populate("theatre", "name city");
    if (!show) return res.status(404).json({ message: "Show not found." });
    res.json({ show });
  } catch (error) { next(error); }
});
router.delete("/shows/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid show id." });
    if (await Booking.exists({ show: req.params.id, status: "confirmed" })) return res.status(409).json({ message: "This show has confirmed bookings. Mark it cancelled instead of deleting it." });
    const show = await Show.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    if (!show) return res.status(404).json({ message: "Show not found." });
    res.json({ message: "Show cancelled." });
  } catch (error) { next(error); }
});

router.get("/bookings", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination(req.query);
    const [bookings, total] = await Promise.all([Booking.find().populate("user", "name email").populate("movie", "title").populate("theatre", "name city").sort({ createdAt: -1 }).skip(skip).limit(limit), Booking.countDocuments()]);
    res.json({ bookings, pagination: paginationMeta(total, page, limit) });
  } catch (error) { next(error); }
});
export default router;
