import { describe, expect, it } from "vitest";
import { folioEntries, paidShare, paymentState, readAmount } from "./folio";

describe("paymentState", () => {
  it("is due until something is paid", () => {
    expect(paymentState({ total: 300, paid: 0, remaining: 300 })).toBe("due");
  });

  it("is part paid while some is still owed", () => {
    expect(paymentState({ total: 345, paid: 100, remaining: 245 })).toBe(
      "partial",
    );
  });

  it("is paid when nothing is left", () => {
    expect(paymentState({ total: 345, paid: 345, remaining: 0 })).toBe("paid");
  });

  it("notices when more was taken than owed", () => {
    expect(paymentState({ total: 300, paid: 320, remaining: -20 })).toBe(
      "credit",
    );
  });
});

describe("paidShare", () => {
  it("is the paid part of the total, never past the ends", () => {
    expect(paidShare({ total: 400, paid: 100 })).toBe(0.25);
    expect(paidShare({ total: 400, paid: 500 })).toBe(1);
    expect(paidShare({ total: 0, paid: 0 })).toBe(0);
  });
});

describe("folioEntries", () => {
  const booking = {
    created_at: "2026-11-01T09:00:00Z",
    numNights: 3,
    totalPrice: 300,
    cabins: { name: "001" },
  };

  it("starts with the nights, then charges and payments as they happened", () => {
    const entries = folioEntries({
      booking,
      charges: [
        {
          id: 2,
          created_at: "2026-11-03T08:00:00Z",
          description: "Laundry",
          amount: 20,
        },
        {
          id: 1,
          created_at: "2026-11-02T08:00:00Z",
          description: "Breakfast",
          amount: 15,
        },
      ],
      payments: [{ id: 7, created_at: "2026-11-02T12:00:00Z", amount: 100 }],
    });

    expect(entries.map((entry) => [entry.label, entry.amount])).toEqual([
      ["3 nights in Cabin 001", 300],
      ["Breakfast", 15],
      ["Cash received", -100],
      ["Laundry", 20],
    ]);
  });
});

describe("readAmount", () => {
  it("reads a positive amount with up to two decimals", () => {
    expect(readAmount("15")).toBe(15);
    expect(readAmount(" 12.5 ")).toBe(12.5);
    expect(readAmount("9,99")).toBe(9.99);
  });

  it("refuses zero, negatives and anything else", () => {
    for (const value of ["0", "-5", "", "abc", "1.234", null])
      expect(readAmount(value)).toBe(null);
  });
});
