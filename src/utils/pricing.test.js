import { describe, expect, it } from "vitest";
import { breakfastPrice, totalWithBreakfast } from "./pricing";

describe("breakfastPrice", () => {
  it("charges per guest, per night", () => {
    expect(breakfastPrice({ breakfastPrice: 15, numNights: 5, numGuests: 2 })).toBe(
      150
    );
  });

  it("is zero when the setting is zero", () => {
    expect(breakfastPrice({ breakfastPrice: 0, numNights: 5, numGuests: 2 })).toBe(
      0
    );
  });

  it("does not return NaN when a value is missing", () => {
    expect(breakfastPrice({ numNights: 3, numGuests: 1 })).toBe(0);
    expect(breakfastPrice({ breakfastPrice: 15, numGuests: 1 })).toBe(0);
  });
});

describe("totalWithBreakfast", () => {
  it("adds the extras when breakfast is taken", () => {
    expect(
      totalWithBreakfast({ totalPrice: 1000, extras: 150, addBreakfast: true })
    ).toBe(1150);
  });

  it("leaves the total alone when it is not", () => {
    expect(
      totalWithBreakfast({ totalPrice: 1000, extras: 150, addBreakfast: false })
    ).toBe(1000);
  });
});
