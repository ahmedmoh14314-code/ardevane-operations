import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { toDay } from "./helpers";

// Every day between two dates, as an array of Date objects
export function eachDay(from, days) {
  const start = startOfDay(from);

  return Array.from({ length: days }, (_, i) => addDays(start, i));
}

// Which column a date falls in, counting from the first visible day.
// Can be negative or past the end when a stay started before, or ends after,
// the window on screen.
export function dayOffset(date, rangeStart) {
  return differenceInCalendarDays(
    startOfDay(toDay(date)),
    startOfDay(rangeStart),
  );
}

// Does a stay show up at all in the days we are looking at?
export function overlapsRange(booking, rangeStart, rangeEnd) {
  const start = toDay(booking.startDate);
  const end = toDay(booking.endDate);

  return start < rangeEnd && end > rangeStart;
}
