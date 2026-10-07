// The day at the front desk: who arrives, who leaves, who is staying, and
// the state each cabin is in. Plain functions, so they are easy to test.

// What a cabin is like to work with. "Occupied" is not here on purpose: a
// cabin is occupied while one of its bookings is checked in. Kept in step
// with the condition check on the cabins table.
export const CABIN_CONDITIONS = {
  ready: { label: "Ready", tag: "green" },
  dirty: { label: "Dirty", tag: "red" },
  cleaning: { label: "Cleaning", tag: "blue" },
  out_of_service: { label: "Out of service", tag: "silver" },
};

export function cabinCondition(condition) {
  return CABIN_CONDITIONS[condition] ?? CABIN_CONDITIONS.ready;
}

// The usual next step for a cabin, and the words on its button:
// dirty → cleaning → ready, and out of service → ready. A ready cabin has
// nothing to do.
export function nextConditionStep(condition) {
  if (condition === "dirty") return { to: "cleaning", label: "Start cleaning" };
  if (condition === "cleaning") return { to: "ready", label: "Mark ready" };
  if (condition === "out_of_service")
    return { to: "ready", label: "Back in service" };
  return null;
}

// How many open cabins are in each condition. Archived cabins don't count.
export function countConditions(cabins = []) {
  const counts = { ready: 0, dirty: 0, cleaning: 0, out_of_service: 0 };

  for (const cabin of cabins)
    if (cabin.is_active !== false && cabin.condition in counts)
      counts[cabin.condition] += 1;

  return counts;
}

// Today's bookings, sorted into the three lists the desk works from:
//   arrivals    reserved, arriving today
//   departures  checked in, leaving today (or already past their last night)
//   inHouse     everyone checked in: a checked-in booking is the stay
export function splitToday(bookings = [], today) {
  return {
    arrivals: bookings.filter(
      (booking) => booking.status === "reserved" && booking.startDate === today,
    ),
    departures: bookings.filter(
      (booking) => booking.status === "checked_in" && booking.endDate <= today,
    ),
    inHouse: bookings.filter((booking) => booking.status === "checked_in"),
  };
}
