import { afterEach, describe, expect, it, vi } from "vitest";
import { getTodayRange } from "./helpers";

describe("getTodayRange", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // 02:30 in the morning, local time: the hour the old exact match failed
  function at(hour, minute) {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 2, hour, minute));

    return getTodayRange();
  }

  it("covers today from local midnight to local midnight", () => {
    const { start, end } = at(14, 0);

    expect(new Date(start)).toEqual(new Date(2026, 9, 2, 0, 0, 0, 0));
    expect(new Date(end)).toEqual(new Date(2026, 9, 2, 23, 59, 59, 999));
  });

  it("still means today in the small hours, when UTC is still on yesterday", () => {
    const { start, end } = at(2, 30);

    expect(new Date(start).getDate()).toBe(2);
    expect(new Date(end).getDate()).toBe(2);
  });

  it("includes a stay saved at local midnight and one saved at UTC midnight", () => {
    const { start, end } = at(9, 0);
    const inRange = (iso) => iso >= start && iso <= end;

    const localMidnight = new Date(2026, 9, 2).toISOString();
    const lateEvening = new Date(2026, 9, 2, 22, 0).toISOString();

    expect(inRange(localMidnight)).toBe(true);
    expect(inRange(lateEvening)).toBe(true);
  });

  it("leaves out yesterday and tomorrow", () => {
    const { start, end } = at(9, 0);
    const inRange = (iso) => iso >= start && iso <= end;

    expect(inRange(new Date(2026, 9, 1, 23, 0).toISOString())).toBe(false);
    expect(inRange(new Date(2026, 9, 3, 0, 30).toISOString())).toBe(false);
  });
});
