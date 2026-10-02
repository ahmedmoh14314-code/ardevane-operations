// Breakfast is charged per guest, per night.
export function breakfastPrice({ breakfastPrice, numNights, numGuests }) {
  return (breakfastPrice || 0) * (numNights || 0) * (numGuests || 0);
}

// What the guest owes once breakfast is either added or left out.
export function totalWithBreakfast({ totalPrice, extras, addBreakfast }) {
  if (!addBreakfast) return totalPrice || 0;

  return (totalPrice || 0) + (extras || 0);
}
