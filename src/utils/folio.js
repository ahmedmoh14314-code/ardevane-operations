// The folio of a stay: the nights, what was added to them, and the cash
// taken. The totals come from the booking_folios view in the database;
// these helpers only describe them and put the entries in order.

// Where the money stands, in one word
export function paymentState({ total = 0, paid = 0, remaining = 0 }) {
  if (remaining < 0) return "credit";
  if (remaining === 0) return total > 0 || paid > 0 ? "paid" : "due";
  if (paid > 0) return "partial";
  return "due";
}

export const PAYMENT_STATES = {
  due: { label: "Payment due", tone: "yellow" },
  partial: { label: "Part paid", tone: "blue" },
  paid: { label: "Paid", tone: "green" },
  credit: { label: "Overpaid", tone: "red" },
};

// How much of the total is paid, from 0 to 1, for the balance ring
export function paidShare({ total = 0, paid = 0 }) {
  if (total <= 0) return paid > 0 ? 1 : 0;
  return Math.min(Math.max(paid / total, 0), 1);
}

// Everything on the folio as one list, oldest first: the nights, then each
// charge and payment as it happened. Charges add, payments take away.
export function folioEntries({ booking, charges = [], payments = [] }) {
  const stay = {
    key: "stay",
    kind: "stay",
    at: booking.created_at,
    label:
      `${booking.numNights} ${booking.numNights === 1 ? "night" : "nights"} in Cabin ${booking.cabins?.name ?? ""}`.trim(),
    amount: booking.totalPrice,
  };

  const added = charges.map((charge) => ({
    key: `charge-${charge.id}`,
    kind: "charge",
    at: charge.created_at,
    label: charge.description,
    amount: charge.amount,
  }));

  const taken = payments.map((payment) => ({
    key: `payment-${payment.id}`,
    kind: "payment",
    at: payment.created_at,
    label: "Cash received",
    amount: -payment.amount,
  }));

  return [
    stay,
    ...[...added, ...taken].sort((a, b) => new Date(a.at) - new Date(b.at)),
  ];
}

// An amount typed at the desk: a positive number with at most two decimals,
// or null when it isn't one
export function readAmount(value) {
  const text = String(value ?? "")
    .trim()
    .replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;

  const amount = Number(text);
  return amount > 0 ? amount : null;
}
