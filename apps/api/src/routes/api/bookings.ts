
import express from "express";
import Booking from "../../models/Booking";
import { sendBookingConfirmationEmail } from "../../services/emailService";

const router = express.Router();

// GET /api/bookings - get all bookings
router.get("/", async (req, res) => {
  try {
    // No need to populate tour since we store tourSlug directly
    const bookings = await Booking.find().sort({ createdAt: -1 }); // Sort by newest first
    console.log(`📋 Fetched ${bookings.length} bookings from MongoDB`);
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
      notes,
      appointmentDate,
      appointmentTime,
      appointmentPurpose,
      customRoutes
    } = req.body;

    // Note: Tours are served from JSON files, not MongoDB
    // So we'll store the tour slug directly instead of a MongoDB reference
    console.log('📝 Creating booking for tour slug:', tourSlug);
    if (customRoutes && customRoutes.length > 0) {
      console.log('📋 Combined tour with', customRoutes.length, 'custom route(s)');
    }

    // Create the booking
    const booking = await Booking.create({
      tourSlug: tourSlug, // Store slug directly instead of MongoDB reference
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
      notes,
      appointmentDate,
      appointmentTime,
      appointmentPurpose,
      customRoutes: customRoutes || []
    });

    console.log('✅ Booking created successfully:', bookingId);

    // Send confirmation email to customer and booking department
    try {
      console.log('📧 Sending booking confirmation emails...');
      const emailResult = await sendBookingConfirmationEmail({
        bookingId,
        customerName,
        customerEmail,
        tourTitle: tourSlug, // Using tourSlug as title for now
        tourDate: selectedDate,
        passengers,
        pricePerPerson: perPerson,
        totalAmount,
        downpaymentAmount: paidAmount < totalAmount ? paidAmount : undefined,
        remainingBalance: paidAmount < totalAmount ? totalAmount - paidAmount : undefined,
        isDownpaymentOnly: paidAmount < totalAmount,
        appointmentDate,
        appointmentTime,
        appointmentPurpose,
        customRoutes: customRoutes || []
      });

      if (emailResult.success) {
        console.log('✅ Confirmation emails sent to customer and booking department');
      } else {
        console.warn('⚠️ Failed to send confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      // Don't fail the booking if email fails
      console.error('⚠️ Email sending error (non-critical):', emailError);
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// GET /api/bookings/:bookingId - get a specific booking by bookingId
router.get("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ bookingId });
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    res.json(booking);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// PATCH /api/bookings/:bookingId/status - update booking status
router.patch("/:bookingId/status", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    const booking = await Booking.findOneAndUpdate(
      { bookingId },
      { status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    console.log(`📝 Updated booking ${bookingId} status to: ${status}`);
    res.json(booking);
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// DELETE /api/bookings/:bookingId - delete a booking
router.delete("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOneAndDelete({ bookingId });
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    console.log(`🗑️ Deleted booking: ${bookingId}`);
    res.json({ message: "Booking deleted successfully", deletedBooking: booking });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// GET /api/bookings/recent/notification - get most recent booking for notification
router.get("/recent/notification", async (req, res) => {
  try {
    const recentBooking = await Booking.findOne({ status: 'confirmed' })
      .sort({ createdAt: -1 })
      .limit(1);
    
    if (!recentBooking) {
      return res.json(null);
    }

    // Calculate time ago
    const bookingTime = new Date(recentBooking.createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - bookingTime.getTime()) / (1000 * 60));
    
    let timeAgo = '';
    if (diffMinutes < 1) {
      timeAgo = 'just now';
    } else if (diffMinutes < 60) {
      timeAgo = `${diffMinutes} min ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
    }

    res.json({
      customerName: recentBooking.customerName,
      tourSlug: recentBooking.tourSlug,
      timeAgo
    });
  } catch (err) {
    console.error("Error fetching recent booking:", err);
    res.status(500).json({ error: "Failed to fetch recent booking" });
  }
});

export default router;
