
import express from "express";
import Booking from "../../models/Booking";
import { requireAdmin } from "../../middleware/auth";

const router = express.Router();


// GET /admin/bookings - list all bookings
router.get("/", requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('tour');
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// GET /admin/bookings/dashboard-stats - booking stats
router.get("/dashboard-stats", requireAdmin, async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    // Add more stats as needed
    res.json({ total });
  } catch {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
