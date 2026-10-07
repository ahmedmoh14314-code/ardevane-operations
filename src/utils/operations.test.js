import { describe, expect, it } from "vitest";
import { countConditions, nextConditionStep, splitToday } from "./operations";

describe("countConditions", () => {
  it("counts the open cabins in each condition", () => {
    const counts = countConditions([
      { condition: "ready" },
      { condition: "dirty" },
      { condition: "dirty" },
      { condition: "cleaning" },
      { condition: "out_of_service" },
      { condition: "dirty", is_active: false },
    ]);

    expect(counts).toEqual({
      ready: 1,
      dirty: 2,
      cleaning: 1,
      out_of_service: 1,
    });
  });
});

describe("nextConditionStep", () => {
  it("goes dirty → cleaning → ready, and back into service", () => {
    expect(nextConditionStep("dirty").to).toBe("cleaning");
    expect(nextConditionStep("cleaning").to).toBe("ready");
    expect(nextConditionStep("out_of_service").to).toBe("ready");
    expect(nextConditionStep("ready")).toBe(null);
  });
});

describe("splitToday", () => {
  const today = "2026-11-05";
  const bookings = [
    {
      id: 1,
      status: "reserved",
      startDate: "2026-11-05",
      endDate: "2026-11-08",
    },
    {
      id: 2,
      status: "reserved",
      startDate: "2026-11-06",
      endDate: "2026-11-09",
    },
    {
      id: 3,
      status: "checked_in",
      startDate: "2026-11-02",
      endDate: "2026-11-05",
    },
    {
      id: 4,
      status: "checked_in",
      startDate: "2026-11-01",
      endDate: "2026-11-04",
    },
    {
      id: 5,
      status: "checked_in",
      startDate: "2026-11-03",
      endDate: "2026-11-10",
    },
  ];

  const ids = (list) => list.map((booking) => booking.id);

  it("arrivals are today's reserved stays", () => {
    expect(ids(splitToday(bookings, today).arrivals)).toEqual([1]);
  });

  it("departures are checked-in stays whose last night has passed", () => {
    expect(ids(splitToday(bookings, today).departures)).toEqual([3, 4]);
  });

  it("everyone checked in is in house", () => {
    expect(ids(splitToday(bookings, today).inHouse)).toEqual([3, 4, 5]);
  });
});
