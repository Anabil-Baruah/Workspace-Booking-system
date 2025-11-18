import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Analytics calculation", () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it("aggregates hours and revenue per room and sorts by revenue", async () => {
    const { bookingService } = await import("../src/services/bookingService");
    const { analyticsService } = await import("../src/services/analyticsService");

    const day = "2025-01-11";
    const b1 = bookingService.createBooking({ roomId: "101", userName: "r1", startTime: `${day}T12:00:00+05:30`, endTime: `${day}T13:00:00+05:30` });
    const b2 = bookingService.createBooking({ roomId: "102", userName: "r2", startTime: `${day}T14:00:00+05:30`, endTime: `${day}T16:00:00+05:30` });
    const b3 = bookingService.createBooking({ roomId: "105", userName: "r3", startTime: `${day}T09:00:00+05:30`, endTime: `${day}T10:30:00+05:30` });
    expect(b1.success && b2.success && b3.success).toBe(true);

    const results = analyticsService.getAnalytics(day, day);
    expect(results.length).toBe(3);

    const r101 = results.find((r) => r.roomId === "101")!;
    const r102 = results.find((r) => r.roomId === "102")!;
    const r105 = results.find((r) => r.roomId === "105")!;

    expect(r101.totalHours).toBe(1);
    expect(r102.totalHours).toBe(2);
    expect(r105.totalHours).toBe(1.5);

    expect(r101.totalRevenue).toBe(300);
    expect(r102.totalRevenue).toBe(800);
    expect(r105.totalRevenue).toBe(300);

    const sorted = [...results];
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].totalRevenue >= sorted[i].totalRevenue).toBe(true);
    }
  });
});