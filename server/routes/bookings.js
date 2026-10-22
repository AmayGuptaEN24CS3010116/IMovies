import { Router } from "express";
import crypto from "node:crypto";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Theatre from "../models/Theatre.js";
import SeatReservation from "../models/SeatReservation.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import { buildSeats } from "../lib/seatUtils.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  let attemptId = null;
  let createdBooking = null;
  try {
    const { movieId, showId, showDate, showTime, seats } = req.body;
    if (!Array.isArray(seats) || seats.length < 1 || seats.length > 8) {
      return res.status(400).json({ message: "Choose between 1 and 8 seats." });
    }
    if (new Set(seats).size !== seats.length) return res.status(400).json({ message: "Duplicate seats are not allowed." });

    let movie;
    let show = null;
    let theatre = null;
    let actualDate = showDate;
    let actualTime = showTime;
    let ticketPrice;

    if (showId) {
      if (!mongoose.isValidObjectId(showId)) return res.status(400).json({ message: "Invalid show selected." });
      show = await Show.findById(showId);
      if (!show || show.status !== "scheduled") return res.status(404).json({ message: "That show is no longer available." });
      movie = await Movie.findById(show.movie);
      theatre = await Theatre.findById(show.theatre);
      actualDate = show.showDate;
      actualTime = show.showTime;
      ticketPrice = show.price;
      const validSeats = new Set(buildSeats(show.seatRows, show.seatsPerRow));
      if (seats.some(seat => !validSeats.has(seat))) return res.status(400).json({ message: "One or more seats do not belong to this screen." });
      const legacyConflicts = await Booking.find({ show: null, movie: movie._id, showDate: actualDate, showTime: actualTime, status: "confirmed", seats: { $in: seats } }).select("seats");
      const legacyTaken = new Set(legacyConflicts.flatMap(b => b.seats));
      const conflict = seats.find(s => legacyTaken.has(s));
      if (conflict) return res.status(409).json({ message: `Seat ${conflict} is already booked. Please choose another seat.` });
    } else {
      if (!movieId || !actualDate || !actualTime) return res.status(400).json({ message: "Movie, date and showtime are required." });
      if (!seats.every(seat => /^[A-F](?:[1-8])$/.test(seat))) return res.status(400).json({ message: "One or more seat numbers are invalid." });
      movie = await Movie.findById(movieId);
      ticketPrice = movie?.price;
    }
    if (!movie) return res.status(404).json({ message: "Movie not found." });

    if (show) {
      attemptId = crypto.randomUUID();
      try {
        await SeatReservation.insertMany(seats.map(seat => ({ show: show._id, seat, attemptId })), { ordered: true });
      } catch (error) {
        await SeatReservation.deleteMany({ attemptId });
        if (error?.code === 11000) return res.status(409).json({ message: "One or more seats were just booked by someone else. Refresh seat availability and choose again." });
        throw error;
      }
    } else {
      const existing = await Booking.find({ movie: movie._id, showDate: actualDate, showTime: actualTime, status: "confirmed", seats: { $in: seats } }).select("seats");
      const taken = new Set(existing.flatMap(b => b.seats));
      const unavailable = seats.filter(s => taken.has(s));
      if (unavailable.length) return res.status(409).json({ message: `These seats are no longer available: ${unavailable.join(", ")}. Please choose again.` });
    }

    createdBooking = await Booking.create({
      user: req.user._id, movie: movie._id, show: show?._id || null, theatre: theatre?._id || null,
      showDate: actualDate, showTime: actualTime, seats, totalAmount: ticketPrice * seats.length,
      paymentStatus: "simulated_success", status: "confirmed",
      bookingCode: `IM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
    });
    const payment = await Payment.create({
      booking: createdBooking._id, user: req.user._id, amount: createdBooking.totalAmount,
      method: "DEMO", status: "simulated_success", reference: `DEMO-${crypto.randomBytes(5).toString("hex").toUpperCase()}`
    });
    createdBooking.payment = payment._id;
    await createdBooking.save();
    if (show) await SeatReservation.updateMany({ attemptId }, { $set: { booking: createdBooking._id, attemptId: null } });
    await Notification.create({ user: req.user._id, title: "Booking confirmed", message: `${movie.title}: ${seats.join(", ")} on ${actualDate} at ${actualTime}. Demo payment only; no money was charged.`, type: "booking", booking: createdBooking._id });
    await createdBooking.populate([
      { path: "movie", select: "title posterUrl duration" },
      { path: "show", populate: { path: "theatre", select: "name city" } },
      { path: "theatre", select: "name city" }
    ]);
    const io = req.app.get("io");
    if (io && show) io.to(`show:${show._id}`).emit("seats-updated", { showId: String(show._id) });
    res.status(201).json({ booking: createdBooking, payment: { reference: payment.reference, status: payment.status, amount: payment.amount, method: payment.method, note: payment.note } });
  } catch (error) {
    if (attemptId) await SeatReservation.deleteMany({ attemptId }).catch(() => {});
    if (createdBooking?._id) {
      await SeatReservation.deleteMany({ booking: createdBooking._id }).catch(() => {});
      await Payment.deleteMany({ booking: createdBooking._id }).catch(() => {});
      await Booking.deleteOne({ _id: createdBooking._id }).catch(() => {});
    }
    next(error);
  }
});

router.get("/my", requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
    const filter = { user: req.user._id };
    const [bookings, total] = await Promise.all([
      Booking.find(filter).populate("movie", "title posterUrl duration").populate({ path: "show", populate: { path: "theatre", select: "name city address" } }).populate("theatre", "name city").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Booking.countDocuments(filter)
    ]);
    res.json({ bookings, pagination: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) { next(error); }
});

router.patch("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid booking id." });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (String(booking.user) !== String(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "You can only cancel your own bookings." });
    if (booking.status !== "confirmed") return res.status(409).json({ message: "Only confirmed bookings can be cancelled." });

    booking.status = "cancelled";
    booking.paymentStatus = booking.payment ? "simulated_refund" : "not_applicable";
    booking.cancelledAt = new Date();
    booking.cancellationReason = String(req.body?.reason || "Cancelled by customer").slice(0, 240);
    await booking.save();
    if (booking.payment) await Payment.findByIdAndUpdate(booking.payment, { status: "simulated_refund", note: "Simulated refund only; no real payment was made." });
    if (booking.show) await SeatReservation.deleteMany({ booking: booking._id });
    await Notification.create({ user: booking.user, title: "Booking cancelled", message: `Booking ${booking.bookingCode} was cancelled. Any refund shown is simulated only.`, type: "cancellation", booking: booking._id });
    const io = req.app.get("io");
    if (io && booking.show) io.to(`show:${booking.show}`).emit("seats-updated", { showId: String(booking.show) });
    await booking.populate("movie", "title posterUrl duration");
    res.json({ booking, message: "Booking cancelled. This demo uses simulated payments; no money was charged or refunded." });
  } catch (error) { next(error); }
});

export default router;
