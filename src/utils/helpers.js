import { differenceInDays, format, formatDistance, parseISO } from "date-fns";

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

// A stay's dates arrive from the database as "2026-11-02". parseISO reads
// that as the day itself, here; new Date() would read it as midnight in
// London, a day early anywhere west of it.
export const toDay = (value) =>
  typeof value === "string" ? parseISO(value) : value;

// A Date as the database writes a day: "2026-11-02"
export const toISODate = (date) => format(date, "yyyy-MM-dd");

export const todayISO = () => toISODate(new Date());

// Has the arrival day come? Days written this way compare as text.
export const hasArrived = (startDate) => startDate <= todayISO();

// Turns 1200 into $1,200.00
export const formatCurrency = (value) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(
    value,
  );
