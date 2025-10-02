import express, { Request, Response } from "express";
import * as tourRepo from "../../services/tourRepo";

const router = express.Router();

// GET /admin/tours - List all tours
router.get("/", async (_req: Request, res: Response) => {
  try {
    const tours = await tourRepo.getAllTours();
    res.json(tours);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/tours - Create a new tour
router.post("/", async (req: Request, res: Response) => {
  try {
    const tour = await tourRepo.createTour(req.body);
    res.status(201).json(tour);
  } catch (error) {
    console.error("Error creating tour:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/tours/:id - Get a single tour by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const tour = await tourRepo.getTourById(req.params.id);
    if (!tour) {
      return res.status(404).json({ error: "not found" });
    }
    res.json(tour);
  } catch (error) {
    console.error("Error fetching tour:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /admin/tours/:id - Update a tour
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const tour = await tourRepo.updateTour(req.params.id, req.body);
    res.json(tour);
  } catch (error) {
    console.error("Error updating tour:", error);
    if ((error as any).code === "P2025") {
      return res.status(404).json({ error: "not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /admin/tours/:id - Delete a tour
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await tourRepo.deleteTour(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting tour:", error);
    if ((error as any).code === "P2025") {
      return res.status(404).json({ error: "not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;