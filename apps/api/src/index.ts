import express, { Request, Response } from "express";
import cors from "cors";
import adminToursRouter from "./routes/admin/tours";
import publicToursRouter from "./routes/public/tours";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/admin/tours", adminToursRouter);
app.use("/public/tours", publicToursRouter);

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});