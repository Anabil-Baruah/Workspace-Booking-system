import { describe, it, expect } from "vitest";
import { calculatePrice } from "../src/utils/pricing";

describe("Dynamic pricing calculation", () => {
  it("calculates non-peak weekday price for 1 hour", () => {
    const base = 200;
    const start = new Date("2025-01-08T14:00:00+05:30");
    const end = new Date("2025-01-08T15:00:00+05:30");
    const price = calculatePrice(base, start, end);
    expect(price).toBe(200);
  });

  it("applies peak multiplier on weekday 10:00-11:00", () => {
    const base = 200;
    const start = new Date("2025-01-08T10:00:00+05:30");
    const end = new Date("2025-01-08T11:00:00+05:30");
    const price = calculatePrice(base, start, end);
    expect(price).toBe(300);
  });

  it("does not apply peak multiplier on weekend", () => {
    const base = 200;
    const start = new Date("2025-01-11T10:00:00+05:30");
    const end = new Date("2025-01-11T11:00:00+05:30");
    const price = calculatePrice(base, start, end);
    expect(price).toBe(200);
  });
});