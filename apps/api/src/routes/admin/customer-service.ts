import express from "express";
import { requireAdmin } from "../../middleware/auth";

const router = express.Router();

// Dummy stats for customer service dashboard
router.get("/stats", requireAdmin, async (req, res) => {
  res.json({
    totalCustomers: 0,
    activeInquiries: 0,
    pendingTasks: 0,
    resolvedToday: 0,
    averageResponseTime: 0,
    customerSatisfactionRate: 0
  });
});

export default router;
