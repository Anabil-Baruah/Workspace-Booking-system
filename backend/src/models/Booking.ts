export interface Booking {
  bookingId: string;
  roomId: string;
  userName: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: Date;
}

export interface CreateBookingDTO {
  roomId: string;
  userName: string;
  startTime: string;
  endTime: string;
}
