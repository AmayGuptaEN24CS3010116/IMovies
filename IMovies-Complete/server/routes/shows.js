import { Router } from "express";
import mongoose from "mongoose";
import Show from "../models/Show.js";
import Theatre from "../models/Theatre.js";
import Booking from "../models/Booking.js";
import SeatReservation from "../models/SeatReservation.js";
import { buildSeats, pagination, paginationMeta } from "../lib/seatUtils.js";

const router = Router();
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, skip } = pagination({ ...req.query, limit: req.query.limit || 100 });
    const filter = { status: "scheduled" };
    if (req.query.movieId && mongoose.isValidObjectId(req.query.movieId)) filter.movie = req.query.movieId;
    if (req.query.theatreId && mongoose.isValidObjectId(req.query.theatreId)) filter.theatre = req.query.theatreId;
    if (req.query.date) filter.showDate = req.query.date;
    if (req.query.city?.trim()) {
      const theatres = await Theatre.find({ active: true, city: { $regex: req.query.city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }).select("_id");
      filter.theatre = { $in: theatres.map(t => t._id) };
    }
    if (!req.query.includePast && !req.query.date) {
      const indiaNow = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
      filter.showDate = { $gte: indiaNow.toISOString().slice(0, 10) };
    }
    const [shows, total] = await Promise.all([
      Show.find(filter).populate("movie", "title posterUrl duration rating price language genre").populate("theatre", "name city address screens").sort({ showDate: 1, showTime: 1 }).skip(skip).limit(limit),
      Show.countDocuments(filter)
    ]);
    res.json({ shows, pagination: paginationMeta(total, page, limit) });
  } catch (error) { next(error); }
});
router.get("/:id/seats", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid show id." });
    const show = await Show.findById(req.params.id).populate("movie", "title");
    if (!show || show.status !== "scheduled") return res.status(404).json({ message: "Show not found or unavailable." });
    const [reservations, legacyBookings] = await Promise.all([
      SeatReservation.find({ show: show._id }).select("seat -_id"),
      Booking.find({ show: null, movie: show.movie._id, showDate: show.showDate, showTime: show.showTime, status: "confirmed" }).select("seats")
    ]);
    const occupied = new Set(reservations.map(item => item.seat));
    legacyBookings.forEach(booking => booking.seats.forEach(seat => occupied.add(seat)));
    res.json({ showId: show._id, seats: buildSeats(show.seatRows, show.seatsPerRow), occupiedSeats: [...occupied], price: show.price });
  } catch (error) { next(error); }
});
export default router;
