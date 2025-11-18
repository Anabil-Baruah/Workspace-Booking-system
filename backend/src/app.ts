import express from "express";
import cors from "cors";
import roomsRouter from "./routes/rooms";
import bookingsRouter from "./routes/bookings";
import analyticsRouter from "./routes/analytics";
import { errorHandler } from "./middleware/errorHandler";

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use("/api/rooms", roomsRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/analytics", analyticsRouter);

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};
