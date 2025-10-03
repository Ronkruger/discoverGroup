import express, { Request, Response } from "express";
import cors from "cors";
import adminToursRouter from "./routes/admin/tours";
import publicToursRouter from "./routes/public/tours";

const app = express();
app.use(cors());
app.use(express.json());

// Root route: provide a small JSON response so GET / is useful in the browser
app.get("/", (_req: Request, res: Response) =>
  res.json({
    message: "API running",
    endpoints: ["/admin/tours", "/public/tours", "/health"],
  })
);

app.use("/admin/tours", adminToursRouter);
app.use("/public/tours", publicToursRouter);

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});