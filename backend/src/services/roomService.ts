import { storage } from "../db/storage";
import { Room } from "../models/Room";

export class RoomService {
  getRooms(): Room[] {
    return storage.getRooms();
  }

  getRoomById(id: string): Room | null {
    const room = storage.getRoomById(id);
    return room || null;
  }
}

export const roomService = new RoomService();
