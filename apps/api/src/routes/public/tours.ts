import express, { Request, Response } from "express";
import Tour from "../../models/Tour";
const router = express.Router();

// Mock tour data (fallback)
const mockTours = [
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
    },
    itinerary: [
      { day: 1, title: "Departure from Manila", description: "Flight to Paris via connecting flights", activities: ["Check-in", "Departure"] },
      { day: 2, title: "Arrival in Paris", description: "City tour and Eiffel Tower visit", activities: ["City tour", "Eiffel Tower", "Seine River cruise"] },
      { day: 3, title: "Paris Exploration", description: "Visit Louvre Museum and Champs-Élysées", activities: ["Louvre Museum", "Champs-Élysées", "Arc de Triomphe"] },
      { day: 4, title: "Travel to Switzerland", description: "Journey to Zurich", activities: ["Train to Zurich", "City orientation", "Lake Zurich"] },
      { day: 5, title: "Swiss Alps Experience", description: "Mountain excursion and scenic views", activities: ["Jungfraujoch", "Mountain railway", "Alpine views"] },
      { day: 6, title: "Travel to Italy", description: "Journey to Milan", activities: ["Travel to Milan", "Duomo Cathedral", "La Scala"] },
      { day: 7, title: "Florence", description: "Art and Renaissance culture", activities: ["Uffizi Gallery", "Ponte Vecchio", "Duomo"] },
      { day: 8, title: "Rome Arrival", description: "Eternal City exploration begins", activities: ["Colosseum", "Roman Forum", "Palatine Hill"] },
      { day: 9, title: "Vatican City", description: "Spiritual and artistic treasures", activities: ["St. Peter's Basilica", "Sistine Chapel", "Vatican Museums"] },
      { day: 10, title: "Rome Continued", description: "More of the Eternal City", activities: ["Trevi Fountain", "Spanish Steps", "Pantheon"] },
      { day: 11, title: "Leisure Day", description: "Free time for personal exploration", activities: ["Shopping", "Cafes", "Personal tours"] },
      { day: 12, title: "Departure Preparation", description: "Last day preparations", activities: ["Packing", "Souvenir shopping", "Farewell dinner"] },
      { day: 13, title: "Return Journey", description: "Flight back to Manila", activities: ["Airport transfer", "Flight departure"] },
      { day: 14, title: "Arrival in Manila", description: "Return home", activities: ["Arrival", "Immigration", "Welcome home"] }
    ],
    departureDates: ["2026-02-04", "2026-02-18", "2026-03-04", "2026-03-18"],
    travelWindow: { start: "2026-02-04", end: "2026-03-31" }
  }
];

// GET /public/tours - return tours from DB, fallback to mock
router.get("/", async (_req: Request, res: Response) => {
  try {
    const tours = await Tour.find().lean().exec();
    if (Array.isArray(tours) && tours.length > 0) {
      return res.json(tours);
    }
    // Fallback to mock data when DB empty
    return res.json(mockTours);
  } catch (err) {
    console.error("Error fetching tours from DB:", err);
    return res.json(mockTours);
  }
});

// GET /public/tours/:slug - return tour by slug from DB, fallback to mock
router.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const tour = await Tour.findOne({ slug }).lean().exec();
    if (tour) return res.json(tour);

    // fallback: try mock data
    const fallback = mockTours.find((t) => t.slug === slug);
    if (fallback) return res.json(fallback);

    return res.status(404).json({ error: "Tour not found" });
  } catch (err) {
    console.error("Error fetching tour by slug from DB:", err);
    const fallback = mockTours.find((t) => t.slug === slug);
    if (fallback) return res.json(fallback);
    return res.status(500).json({ error: "Failed to fetch tour" });
  }
});

export default router;