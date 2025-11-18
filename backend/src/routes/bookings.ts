import { Router } from "express";
import { bookingService } from "../services/bookingService";

const router = Router();

router.post("/", (req, res) => {
  const result = bookingService.createBooking(req.body);
  
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json(result.data);
});

router.get("/", (req, res) => {
  const bookings = bookingService.getBookings();
  res.json(bookings);
});

router.post("/:id/cancel", (req, res) => {
  const result = bookingService.cancelBooking(req.params.id);
  
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ message: result.message });
});

export default router;
