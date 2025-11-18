import { Router } from "express";
import { analyticsService } from "../services/analyticsService";

const router = Router();

router.get("/", (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "from and to query parameters are required" });
  }

  const results = analyticsService.getAnalytics(from as string, to as string);
  res.json(results);
});

export default router;
