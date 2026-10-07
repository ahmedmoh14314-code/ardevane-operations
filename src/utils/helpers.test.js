import { afterEach, describe, expect, it, vi } from "vitest";
import { hasArrived, toDay, toISODate, todayISO } from "./helpers";

afterEach(() => {
  vi.useRealTimers();
});

describe("toDay", () => {
  it("reads a database day as that day, at local midnight", () => {
    const day = toDay("2026-11-02");

    expect(day.getFullYear()).toBe(2026);
    expect(day.getMonth()).toBe(10);
    expect(day.getDate()).toBe(2);
    expect(day.getHours()).toBe(0);
  });

  it("passes Dates through untouched", () => {
    const date = new Date(2026, 10, 2, 15, 30);

    expect(toDay(date)).toBe(date);
  });
});

describe("toISODate", () => {
  it("writes the local day, not the UTC one", () => {
    // 01:30 local is still the evening before in UTC west of here
    expect(toISODate(new Date(2026, 10, 2, 1, 30))).toBe("2026-11-02");
    expect(toISODate(new Date(2026, 10, 2, 23, 30))).toBe("2026-11-02");
  });
});

describe("hasArrived", () => {
  function on(year, month, day) {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(year, month, day, 9, 0));
  }

  it("is true from the arrival day on", () => {
    on(2026, 10, 2);

    expect(todayISO()).toBe("2026-11-02");
    expect(hasArrived("2026-11-02")).toBe(true);
    expect(hasArrived("2026-10-30")).toBe(true);
  });

  it("is false before it", () => {
    on(2026, 10, 2);

    expect(hasArrived("2026-11-03")).toBe(false);
    expect(hasArrived("2026-12-01")).toBe(false);
  });
});
