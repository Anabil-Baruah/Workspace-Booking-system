export function validateBookingTimes(startTime: Date, endTime: Date): string | null {
  if (startTime >= endTime) {
    return "Start time must be before end time";
  }

  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  if (durationHours > 12) {
    return "Booking duration cannot exceed 12 hours";
  }

  return null;
}

export function validateCancellation(booking: { startTime: Date; status: string }): string | null {
  if (booking.status === "CANCELLED") {
    return "Booking is already cancelled";
  }

  const now = new Date();
  const hoursUntilStart = (booking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilStart <= 2) {
    return "Cannot cancel booking less than 2 hours before start time";
  }

  return null;
}
