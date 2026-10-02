import { describe, expect, it } from "vitest";
import { dayOffset, eachDay, overlapsRange } from "./dates";

describe("eachDay", () => {
  it("returns one date per day, starting at the given day", () => {
    const days = eachDay(new Date("2026-10-01T12:00:00"), 3);

    expect(days).toHaveLength(3);
    expect(days[0].getDate()).toBe(1);
    expect(days[2].getDate()).toBe(3);
  });

  it("starts at midnight, whatever time it is handed", () => {
    const [first] = eachDay(new Date("2026-10-01T23:30:00"), 1);

    expect(first.getHours()).toBe(0);
  });
});

describe("dayOffset", () => {
  const start = new Date("2026-10-01T00:00:00");

  it("is zero on the first day", () => {
    expect(dayOffset(new Date("2026-10-01T18:00:00"), start)).toBe(0);
  });

  it("counts days forward", () => {
    expect(dayOffset(new Date("2026-10-06T00:00:00"), start)).toBe(5);
  });

  it("goes negative for a stay that began earlier", () => {
    expect(dayOffset(new Date("2026-09-28T00:00:00"), start)).toBe(-3);
  });
});

describe("overlapsRange", () => {
  const from = new Date("2026-10-01");
  const to = new Date("2026-10-15");

  it("includes a stay that sits inside the window", () => {
    const booking = { startDate: "2026-10-03", endDate: "2026-10-07" };

    expect(overlapsRange(booking, from, to)).toBe(true);
  });

  it("includes a stay that started before the window", () => {
    const booking = { startDate: "2026-09-25", endDate: "2026-10-04" };

    expect(overlapsRange(booking, from, to)).toBe(true);
  });

  it("excludes a stay that finished before the window", () => {
    const booking = { startDate: "2026-09-10", endDate: "2026-09-20" };

    expect(overlapsRange(booking, from, to)).toBe(false);
  });

  it("excludes a stay that starts after the window", () => {
    const booking = { startDate: "2026-11-01", endDate: "2026-11-05" };

    expect(overlapsRange(booking, from, to)).toBe(false);
  });
});
