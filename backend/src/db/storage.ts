import { Room } from "../models/Room";
import { Booking } from "../models/Booking";

class InMemoryStorage {
  private rooms: Room[] = [
    { id: "101", name: "Cabin 1", baseHourlyRate: 300, capacity: 4 },
    { id: "102", name: "Cabin 2", baseHourlyRate: 400, capacity: 6 },
    { id: "103", name: "Conference Room A", baseHourlyRate: 600, capacity: 10 },
    { id: "104", name: "Meeting Room B", baseHourlyRate: 500, capacity: 8 },
    { id: "105", name: "Open Desk", baseHourlyRate: 200, capacity: 2 },
  ];

  private bookings: Booking[] = [];
  private bookingIdCounter = 1;

  getRooms(): Room[] {
    return [...this.rooms];
  }

  getRoomById(id: string): Room | undefined {
    return this.rooms.find((room) => room.id === id);
  }

  getBookings(): Booking[] {
    return [...this.bookings];
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.find((booking) => booking.bookingId === id);
  }

  addBooking(booking: Omit<Booking, "bookingId" | "createdAt">): Booking {
    const newBooking: Booking = {
      ...booking,
      bookingId: `b${this.bookingIdCounter++}`,
      createdAt: new Date(),
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  updateBooking(bookingId: string, updates: Partial<Booking>): Booking | null {
    const index = this.bookings.findIndex((b) => b.bookingId === bookingId);
    if (index === -1) return null;
    
    this.bookings[index] = { ...this.bookings[index], ...updates };
    return this.bookings[index];
  }

  getBookingsByRoom(roomId: string): Booking[] {
    return this.bookings.filter((booking) => booking.roomId === roomId);
  }
}

export const storage = new InMemoryStorage();
