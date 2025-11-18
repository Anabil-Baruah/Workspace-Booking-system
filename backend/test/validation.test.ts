import { describe, it, expect } from "vitest";
import { validateBookingTimes } from "../src/utils/validation";

describe("Booking duration validation", () => {
  it("rejects when start is after or equal to end", () => {
    const start = new Date("2025-01-08T12:00:00+05:30");
    const end = new Date("2025-01-08T12:00:00+05:30");
    const err = validateBookingTimes(start, end);
    expect(err).toBe("Start time must be before end time");
  });

  it("rejects duration exceeding 12 hours", () => {
    const start = new Date("2025-01-08T06:00:00+05:30");
    const end = new Date("2025-01-08T19:00:00+05:30");
    const err = validateBookingTimes(start, end);
    expect(err).toBe("Booking duration cannot exceed 12 hours");
  });

  it("accepts valid duration", () => {
    const start = new Date("2025-01-08T10:00:00+05:30");
    const end = new Date("2025-01-08T12:00:00+05:30");
    const err = validateBookingTimes(start, end);
    expect(err).toBeNull();
  });
});