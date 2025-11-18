import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Booking conflict detection", () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it("rejects overlapping booking for the same room", async () => {
    const { bookingService } = await import("../src/services/bookingService");
    const base = new Date("2025-02-05T09:00:00+05:30");
    const firstStart = new Date(base);
    const firstEnd = new Date("2025-02-05T10:00:00+05:30");
    const result1 = bookingService.createBooking({ roomId: "101", userName: "a", startTime: firstStart.toISOString(), endTime: firstEnd.toISOString() });
    expect(result1.success).toBe(true);

    const overlapStart = new Date("2025-02-05T09:30:00+05:30");
    const overlapEnd = new Date("2025-02-05T10:30:00+05:30");
    const result2 = bookingService.createBooking({ roomId: "101", userName: "b", startTime: overlapStart.toISOString(), endTime: overlapEnd.toISOString() });
    expect(result2.success).toBe(false);
    expect(result2.error).toContain("Room already booked");
  });

  it("allows non-overlapping booking for the same room", async () => {
    const { bookingService } = await import("../src/services/bookingService");
    const firstStart = new Date("2025-02-06T08:00:00+05:30");
    const firstEnd = new Date("2025-02-06T09:00:00+05:30");
    const r1 = bookingService.createBooking({ roomId: "101", userName: "x", startTime: firstStart.toISOString(), endTime: firstEnd.toISOString() });
    expect(r1.success).toBe(true);

    const secondStart = new Date("2025-02-06T09:00:00+05:30");
    const secondEnd = new Date("2025-02-06T10:00:00+05:30");
    const r2 = bookingService.createBooking({ roomId: "101", userName: "y", startTime: secondStart.toISOString(), endTime: secondEnd.toISOString() });
    expect(r2.success).toBe(true);
  });
});