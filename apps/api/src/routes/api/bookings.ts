
import express from "express";
import Booking from "../../models/Booking";
import Tour from "../../models/Tour";

const router = express.Router();

// GET /api/bookings - get all bookings (with populated tour)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("tour");
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// POST /api/bookings - create a new booking
router.post("/", async (req, res) => {
  try {
    const {
      tourSlug,
      customerName,
      customerEmail,
      customerPhone,
      customerPassport,
      selectedDate,
      passengers,
      perPerson,
      totalAmount,
      paidAmount,
      paymentType,
      status,
      bookingId,
      bookingDate,
      paymentIntentId,
      notes
    } = req.body;

    // Find the tour by slug
    const tour = await Tour.findOne({ slug: tourSlug });
    if (!tour) {
      return res.status(400).json({ error: "Tour not found" });
    }

    // Create the booking
    const booking = await Booking.create({
      tour: tour._id,
      customerName,
      customerEmail,
      customerPhone,
      customerPassport,
      selectedDate,
      passengers,
      perPerson,
      totalAmount,
      paidAmount,
      paymentType,
      status,
      bookingId,
      bookingDate,
      paymentIntentId,
      notes
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

export default router;
