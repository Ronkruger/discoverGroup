import express, { Request, Response } from "express";
import Tour from "../../models/Tour";
import { requireAuth, requireAdmin } from "../../middleware/auth";

const router = express.Router();

// Lightweight plain-tour type used for runtime objects returned by Mongoose -> lean()
type PlainTour = {
  _id?: unknown;
  id?: string;
  slug?: string;
  [key: string]: unknown;
};

// GET /admin/tours - list tours from MongoDB
router.get("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  console.log(`[admin/tours] GET / requested from origin=${req.headers.origin} ip=${req.ip}`);
  try {
    const tours = await Tour.find().sort({ createdAt: -1 }).lean().exec();
    // Normalize each tour to include `id` (admin UI expects `id` field)
    const normalized = tours.map((t: PlainTour) => ({
      ...(t as Record<string, unknown> || {}),
      id: t.id ?? t.slug ?? (t._id ? String(t._id) : undefined),
    }));
    res.json(normalized);
  } catch (err) {
    console.error("Error fetching admin tours:", err);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

// POST /admin/tours - create a new tour
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const tour = new Tour(payload);
    await tour.save();
    const t = tour.toObject();
    t.id = t.id ?? t.slug ?? String(t._id);
    res.status(201).json(t);
  } catch (err) {
    console.error("Error creating tour:", err);
    res.status(500).json({ error: "Failed to create tour" });
  }
});

// GET /admin/tours/:idOrSlug - get by Mongo _id or slug
router.get("/:idOrSlug", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  console.log(`[admin/tours] GET /${idOrSlug} requested from origin=${req.headers.origin} ip=${req.ip}`);
  try {
    // Try ObjectId first
    let tour = null;
    if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
      tour = await Tour.findById(idOrSlug).lean().exec();
    }
    if (!tour) {
      tour = await Tour.findOne({ slug: idOrSlug }).lean().exec();
    }
    if (!tour) return res.status(404).json({ error: "not found" });
  const t = { ...(tour as Record<string, unknown>) } as PlainTour;
  t.id = t.id ?? t.slug ?? (t._id ? String(t._id) : undefined);
    res.json(t);
  } catch (err) {
    console.error("Error fetching tour:", err);
    res.status(500).json({ error: "Failed to fetch tour" });
  }
});

// PUT /admin/tours/:idOrSlug - update existing tour by _id or slug
router.put("/:idOrSlug", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  try {
    const filter = (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) ? { _id: idOrSlug } : { slug: idOrSlug };
    const updated = await Tour.findOneAndUpdate(filter, req.body, { new: true, runValidators: true }).lean().exec();
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error updating tour:", err);
    res.status(500).json({ error: "Failed to update tour" });
  }
});

// DELETE /admin/tours/:idOrSlug - delete tour by _id or slug
router.delete("/:idOrSlug", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  try {
    const filter = (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) ? { _id: idOrSlug } : { slug: idOrSlug };
    const deleted = await Tour.findOneAndDelete(filter).lean().exec();
    if (!deleted) return res.status(404).json({ error: "not found" });
    res.status(204).end();
  } catch (err) {
    console.error("Error deleting tour:", err);
    res.status(500).json({ error: "Failed to delete tour" });
  }
});

export default router;