import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Cancellation rules", () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it("rejects cancelling an already cancelled booking", async () => {
    const { validateCancellation } = await import("../src/utils/validation");
    const booking = { startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), status: "CANCELLED" } as any;
    const err = validateCancellation(booking);
    expect(err).toBe("Booking is already cancelled");
  });

  it("rejects cancellation within 2 hours of start", async () => {
    const { validateCancellation } = await import("../src/utils/validation");
    const booking = { startTime: new Date(Date.now() + 60 * 60 * 1000), status: "CONFIRMED" } as any;
    const err = validateCancellation(booking);
    expect(err).toBe("Cannot cancel booking less than 2 hours before start time");
  });

  it("allows cancellation when more than 2 hours before start via service", async () => {
    const { bookingService } = await import("../src/services/bookingService");
    const now = Date.now();
    const start = new Date(now + 3 * 60 * 60 * 1000);
    const end = new Date(now + 4 * 60 * 60 * 1000);
    const create = bookingService.createBooking({ roomId: "101", userName: "u", startTime: start.toISOString(), endTime: end.toISOString() });
    expect(create.success).toBe(true);
    const bookingId = create.data!.bookingId;
    const cancel = bookingService.cancelBooking(bookingId);
    expect(cancel.success).toBe(true);
  });
});