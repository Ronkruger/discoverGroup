

// Type definitions for tours
interface BaseTour {
  id: string;
  slug: string;
  title: string;
  durationDays: number;
}

interface FullTour extends BaseTour {
  summary: string;
  line: string;
  highlights: string[];
  images: string[];
  guaranteedDeparture: boolean;
  regularPricePerPerson: number;
  promoPricePerPerson: number;
  allowsDownpayment: boolean;
  additionalInfo: {
    countriesVisited: string[];
    startingPoint: string;
    endingPoint: string;
  };
}

import express from "express";
import Booking from "../../models/Booking";
import { requireAdmin } from "../../middleware/auth";

const router = express.Router();

// Interface for booking response with populated tour data (removed — not used)

// Import tour data from both systems
const mockTours: FullTour[] = [
  {
    id: "route-a-preferred",
    slug: "route-a-preferred",
    title: "Route A Preferred - European Adventure",
    summary: "14-day journey through France, Switzerland, Italy, and Vatican City.",
    line: "ROUTE_A",
    durationDays: 14,
    highlights: ["Paris", "Zurich", "Milan", "Florence", "Rome"],
    images: ["/image.png"],
    guaranteedDeparture: true,
    regularPricePerPerson: 250000,
    promoPricePerPerson: 160000,
    allowsDownpayment: true,
    additionalInfo: {
      countriesVisited: ["France", "Switzerland", "Italy", "Vatican City"],
      startingPoint: "Manila, Philippines",
      endingPoint: "Manila, Philippines"
    }
  }
];

// Admin tours (in-memory)
const ADMIN_TOURS: BaseTour[] = [
  { id: "1", slug: "route-a-preferred", title: "Route A Preferred - European Adventure", durationDays: 14 }
];

// GET /admin/bookings - list all bookings
router.get("/", requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    
    // Manually populate tour data using tourSlug
    const populatedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject() as unknown as Record<string, unknown>;
      
      // First try to find in mockTours (has complete data)
      let tour: BaseTour | FullTour | undefined = mockTours.find(t => t.slug === booking.tourSlug);
      
      // If not found, try admin tours (basic data only)
      if (!tour) {
        tour = ADMIN_TOURS.find(t => t.slug === booking.tourSlug);
      }
      
      // Format tour data for admin panel
      if (tour) {
        // Build a strongly-typed tour object and assign without using `any`
        const tourData: Record<string, unknown> = {
          id: String(tour.id ?? tour.slug),
          slug: tour.slug,
          title: tour.title,
          durationDays: tour.durationDays,
          // Only include these fields if they exist (from mockTours)
          ...(('summary' in tour) && { summary: tour.summary }),
          ...(('highlights' in tour) && { highlights: tour.highlights }),
          ...(('images' in tour) && { images: tour.images }),
          ...(('guaranteedDeparture' in tour) && { guaranteedDeparture: tour.guaranteedDeparture }),
          ...(('allowsDownpayment' in tour) && { allowsDownpayment: tour.allowsDownpayment }),
          ...(('additionalInfo' in tour) && { additionalInfo: tour.additionalInfo })
        };
        bookingObj['tour'] = tourData;
      }
      
      return bookingObj;
    });
    
    res.json(populatedBookings);
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// GET /admin/bookings/dashboard-stats - booking stats
router.get("/dashboard-stats", requireAdmin, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayBookings = await Booking.countDocuments({
      bookingDate: { $gte: todayStart.toISOString() }
    });
    
    const todayRevenue = await Booking.aggregate([
      { $match: { bookingDate: { $gte: todayStart.toISOString() } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    res.json({
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayBookings,
      todayRevenue: todayRevenue[0]?.total || 0,
      weeklyGrowth: 0, // TODO: Calculate actual growth
      monthlyGrowth: 0 // TODO: Calculate actual growth
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Sync admin tours with any new tours created
router.post("/sync-tours", requireAdmin, async (req, res) => {
  try {
    // This endpoint could be used to sync tours between admin and public systems
    res.json({ message: "Tour sync completed", tours: ADMIN_TOURS });
  } catch {
    res.status(500).json({ error: "Failed to sync tours" });
  }
});

export default router;
