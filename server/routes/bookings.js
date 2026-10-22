import { Router } from "express";
import crypto from "node:crypto";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { movieId, showDate, showTime, seats } = req.body;
    if (!movieId || !showDate || !showTime || !Array.isArray(seats) || seats.length < 1) {
      return res.status(400).json({ message: "Movie, date, showtime and at least one seat are required." });
    }
    if (new Set(seats).size !== seats.length) return res.status(400).json({ message: "Duplicate seats are not allowed." });
    if (seats.some(s => !/^[A-F]([1-8])$/.test(s))) return res.status(400).json({ message: "One or more seat numbers are invalid." });

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found." });

    const existing = await Booking.find({
      movie: movieId, showDate, showTime, status: "confirmed", seats: { $in: seats }
    }).select("seats");
    const taken = new Set(existing.flatMap(b => b.seats));
    const unavailable = seats.filter(s => taken.has(s));
    if (unavailable.length) return res.status(409).json({ message: `These seats are no longer available: ${unavailable.join(", ")}. Please choose again.` });

    const booking = await Booking.create({
      user: req.user._id, movie: movieId, showDate, showTime, seats,
      totalAmount: movie.price * seats.length,
      bookingCode: `IM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
    });
    await booking.populate("movie", "title posterUrl duration");
    res.status(201).json({ booking });
  } catch (error) { next(error); }
});

router.get("/my", requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("movie", "title posterUrl duration")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) { next(error); }
});

export default router;
