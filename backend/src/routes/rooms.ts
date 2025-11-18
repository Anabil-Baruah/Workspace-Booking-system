import { Router } from "express";
import { roomService } from "../services/roomService";

const router = Router();

router.get("/", (req, res) => {
  const rooms = roomService.getRooms();
  res.json(rooms);
});

export default router;
