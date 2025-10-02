import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.json([
    { slug: "route-a-preferred", title: "Route A Preferred - European Adventure", durationDays: 14 }
  ]);
});

export default router;