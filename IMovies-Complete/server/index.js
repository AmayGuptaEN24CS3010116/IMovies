import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import bookingRoutes from "./routes/bookings.js";
import theatreRoutes from "./routes/theatres.js";
import showRoutes from "./routes/shows.js";
import notificationRoutes from "./routes/notifications.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";
import { ensureDemoData } from "./bootstrapData.js";
import Booking from "./models/Booking.js";
import Show from "./models/Show.js";
import SeatReservation from "./models/SeatReservation.js";
import Payment from "./models/Payment.js";
import Notification from "./models/Notification.js";

dotenv.config();
const app = express();
const server = createServer(app);
const configuredOrigins = String(process.env.CLIENT_URL || "http://localhost:5173")
  .split(",").map(value => value.trim().replace(/\/$/, "")).filter(Boolean);
const allowedOrigins = [...new Set([...configuredOrigins, "http://localhost:5173", "http://127.0.0.1:5173"] )];
const originAllowed = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) return callback(null, true);
  return callback(new Error(`Origin not allowed by CORS: ${origin}`));
};
const io = new Server(server, { cors: { origin: originAllowed, methods: ["GET", "POST"] } });
app.set("io", io);
app.set("trust proxy", 1);
app.use(cors({ origin: originAllowed, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json({ limit: "1mb" }));

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false, message: { message: "Too many requests. Please try again in a few minutes." } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false, message: { message: "Too many authentication attempts. Please wait and try again." } });
const bookingLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: "draft-7", legacyHeaders: false, message: { message: "Too many booking attempts. Please try again shortly." } });
app.use("/api", apiLimiter);
app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "IMovies API", realtime: true }));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingLimiter, bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use((_req, res) => res.status(404).json({ message: "API route not found." }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message?.startsWith("Origin not allowed by CORS:")) return res.status(403).json({ message: err.message });
  if (err?.code === 11000) return res.status(409).json({ message: "A record with those details already exists." });
  if (err?.name === "ValidationError" || err?.name === "CastError") return res.status(400).json({ message: err.message });
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

io.on("connection", socket => {
  socket.on("join-show", showId => {
    if (typeof showId === "string" && mongoose.isValidObjectId(showId)) socket.join(`show:${showId}`);
  });
  socket.on("leave-show", showId => {
    if (typeof showId === "string" && mongoose.isValidObjectId(showId)) socket.leave(`show:${showId}`);
  });
});

const port = process.env.PORT || 8000;
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/imovies")
  .then(async () => {
    // Build uniqueness/query indexes before accepting traffic. In particular, the show-seat
    // unique index must exist before any booking request can attempt a reservation.
    await Promise.all([Booking.init(), Show.init(), SeatReservation.init(), Payment.init(), Notification.init()]);
    await ensureDemoData();
    server.listen(port, () => console.log(`IMovies API running on port ${port}`));
  })
  .catch(error => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

export { app, server, io };
