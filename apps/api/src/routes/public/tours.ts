import express, { Request, Response } from "express";
import Tour from "../../models/Tour";
const router = express.Router();


// GET /public/tours - return tours from MongoDB only
router.get("/", async (_req: Request, res: Response) => {
  try {
    const tours = await Tour.find().lean().exec();
    return res.json(Array.isArray(tours) ? tours : []);
  } catch (err) {
    console.error("Error fetching tours from DB:", err);
    return res.status(500).json({ error: "Failed to fetch tours" });
  }
});

// GET /public/tours/:slug - return tour by slug from MongoDB only
router.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const tour = await Tour.findOne({ slug }).lean().exec();
    if (tour) return res.json(tour);
    return res.status(404).json({ error: "Tour not found" });
  } catch (err) {
    console.error("Error fetching tour by slug from DB:", err);
    return res.status(500).json({ error: "Failed to fetch tour" });
  }
});

export default router;