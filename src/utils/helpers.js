import {
  differenceInDays,
  endOfDay,
  formatDistance,
  parseISO,
  startOfDay,
} from "date-fns";

// Whole days between two dates
export const subtractDates = (dateStr1, dateStr2) =>
  // String() so it takes both Dates and Supabase strings
  differenceInDays(parseISO(String(dateStr1)), parseISO(String(dateStr2)));

// Turns a date into "in 3 days"
export const formatDistanceFromNow = (dateStr) =>
  formatDistance(parseISO(dateStr), new Date(), {
    addSuffix: true,
  })
    .replace("about ", "")
    .replace("in", "In");

// Today at the start, or the very end, of the day
export const getToday = function (options = {}) {
  const today = new Date();

  // End of day, so it compares correctly against created_at
  if (options?.end) today.setUTCHours(23, 59, 59, 999);
  else today.setUTCHours(0, 0, 0, 0);

  // Zeroed first, or the string would change on every render
  return today.toISOString();
};

// The first and last moment of today where the hotel is, as ISO strings.
// A stay counts as today whatever hour it was saved with, and the day turns
// over at local midnight rather than at midnight in London.
export const getTodayRange = function () {
  const now = new Date();

  return {
    start: startOfDay(now).toISOString(),
    end: endOfDay(now).toISOString(),
  };
};

// Turns 1200 into $1,200.00
export const formatCurrency = (value) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(
    value,
  );
