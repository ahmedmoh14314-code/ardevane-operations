import { describe, expect, it } from "vitest";
import { withStats } from "./apiGuests";

const past = {
  id: 1,
  startDate: "2020-01-01",
  endDate: "2020-01-06",
  numNights: 5,
  totalPrice: 500,
  status: "checked-out",
};
const future = {
  id: 2,
  startDate: "2090-01-01",
  endDate: "2090-01-04",
  numNights: 3,
  totalPrice: 300,
  status: "unconfirmed",
};
const cancelled = {
  id: 3,
  startDate: "2021-01-01",
  endDate: "2021-01-03",
  numNights: 2,
  totalPrice: 200,
  status: "cancelled",
};

describe("withStats", () => {
  it("counts stays, nights and spend", () => {
    const { stats } = withStats({ id: 9, bookings: [past, future] });

    expect(stats.stays).toBe(2);
    expect(stats.nights).toBe(8);
    expect(stats.spend).toBe(800);
  });

  it("leaves cancelled stays out of the totals", () => {
    const { stats } = withStats({ id: 9, bookings: [past, cancelled] });

    expect(stats.stays).toBe(1);
    expect(stats.nights).toBe(5);
    expect(stats.spend).toBe(500);
  });

  it("finds the next booked stay", () => {
    const { stats } = withStats({ id: 9, bookings: [past, future] });

    expect(stats.upcomingStay.id).toBe(future.id);
    expect(stats.currentStay).toBeNull();
  });

  it("finds the stay happening right now", () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000).toISOString();
    const tomorrow = new Date(today.getTime() + 86400000).toISOString();

    const ongoing = {
      id: 4,
      startDate: yesterday,
      endDate: tomorrow,
      numNights: 2,
      totalPrice: 200,
      status: "checked-in",
    };
    const { stats } = withStats({ id: 9, bookings: [ongoing] });

    expect(stats.currentStay.id).toBe(ongoing.id);
  });

  it("copes with a guest who has never booked", () => {
    const { stats } = withStats({ id: 9, bookings: [] });

    expect(stats.stays).toBe(0);
    expect(stats.spend).toBe(0);
    expect(stats.currentStay).toBeNull();
    expect(stats.upcomingStay).toBeNull();
  });

  it("returns the bookings sorted by start date", () => {
    const { bookings } = withStats({ id: 9, bookings: [future, past] });

    expect(bookings.map((b) => b.id)).toEqual([past.id, future.id]);
  });
});
