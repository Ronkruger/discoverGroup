import express, { Request, Response } from "express";
const router = express.Router();

type Tour = {
  id: string;
  slug?: string;
  title?: string;
  durationDays?: number;
};

let TOURS: Tour[] = [
  { id: "1", slug: "route-a-preferred", title: "Route A Preferred - European Adventure", durationDays: 14 }
];

router.get("/", (_req: Request, res: Response) => res.json(TOURS));

router.post("/", (req: Request, res: Response) => {
  const next: Tour = { id: String(TOURS.length + 1), ...req.body };
  TOURS.push(next);
  res.status(201).json(next);
});

router.get("/:id", (req: Request, res: Response) => {
  const found = TOURS.find((t) => t.id === req.params.id);
  if (!found) return res.status(404).json({ error: "not found" });
  res.json(found);
});

router.put("/:id", (req: Request, res: Response) => {
  const idx = TOURS.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  TOURS[idx] = { ...TOURS[idx], ...req.body };
  res.json(TOURS[idx]);
});

router.delete("/:id", (req: Request, res: Response) => {
  TOURS = TOURS.filter((t) => t.id !== req.params.id);
  res.status(204).end();
});

export default router;