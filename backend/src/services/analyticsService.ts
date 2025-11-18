import { storage } from "../db/storage";

interface AnalyticsResult {
  roomId: string;
  roomName: string;
  totalHours: number;
  totalRevenue: number;
}

export class AnalyticsService {
  getAnalytics(fromDate: string, toDate: string): AnalyticsResult[] {
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const bookings = storage.getBookings().filter(
      (booking) =>
        booking.status === "CONFIRMED" &&
        booking.startTime >= from &&
        booking.endTime <= to
    );

    const roomStats = new Map<string, { hours: number; revenue: number }>();

    bookings.forEach((booking) => {
      const hours = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
      
      const existing = roomStats.get(booking.roomId) || { hours: 0, revenue: 0 };
      roomStats.set(booking.roomId, {
        hours: existing.hours + hours,
        revenue: existing.revenue + booking.totalPrice,
      });
    });

    const results: AnalyticsResult[] = [];
    const rooms = storage.getRooms();

    roomStats.forEach((stats, roomId) => {
      const room = rooms.find((r) => r.id === roomId);
      results.push({
        roomId,
        roomName: room?.name || roomId,
        totalHours: Math.round(stats.hours * 10) / 10,
        totalRevenue: stats.revenue,
      });
    });

    return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
}

export const analyticsService = new AnalyticsService();
