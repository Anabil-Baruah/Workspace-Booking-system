import { storage } from "../db/storage";
import { Booking, CreateBookingDTO } from "../models/Booking";
import { calculatePrice } from "../utils/pricing";
import { validateBookingTimes, validateCancellation } from "../utils/validation";
import { checkOverlap, formatTime } from "../utils/datetime";

export class BookingService {
  createBooking(dto: CreateBookingDTO): { success: boolean; data?: Booking; error?: string } {
    const { roomId, userName, startTime: startTimeStr, endTime: endTimeStr } = dto;

    // Validate room exists
    const room = storage.getRoomById(roomId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    // Parse times
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    // Validate times
    const timeError = validateBookingTimes(startTime, endTime);
    if (timeError) {
      return { success: false, error: timeError };
    }

    // Check for conflicts
    const existingBookings = storage.getBookingsByRoom(roomId);
    const conflict = existingBookings.find(
      (booking) =>
        booking.status === "CONFIRMED" &&
        checkOverlap(startTime, endTime, booking.startTime, booking.endTime)
    );

    if (conflict) {
      const conflictMsg = `Room already booked from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)}`;
      return { success: false, error: conflictMsg };
    }

    // Calculate price
    const totalPrice = calculatePrice(room.baseHourlyRate, startTime, endTime);

    // Create booking
    const booking = storage.addBooking({
      roomId,
      userName,
      startTime,
      endTime,
      totalPrice,
      status: "CONFIRMED",
    });

    return { success: true, data: booking };
  }

  getBookings(): Booking[] {
    return storage.getBookings();
  }

  cancelBooking(bookingId: string): { success: boolean; message?: string; error?: string } {
    const booking = storage.getBookingById(bookingId);
    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    const validationError = validateCancellation(booking);
    if (validationError) {
      return { success: false, error: validationError };
    }

    storage.updateBooking(bookingId, { status: "CANCELLED" });
    return { success: true, message: "Booking cancelled successfully" };
  }
}

export const bookingService = new BookingService();
