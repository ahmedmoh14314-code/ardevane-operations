import { getToday, getTodayRange } from "../utils/helpers";
import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

// One page of bookings, filtered and sorted
export async function getBookings({ filter, sortBy, page }) {
  let query = supabase.from("bookings").select(
    "id, created_at, startDate, endDate, numNights, numGuests, status, totalPrice, cabins(name), guests(fullName, email)",
    // count tells the pagination how many rows exist
    { count: "exact" }
  );

  // Filter on the server, not here
  if (filter) query = query[filter.method || "eq"](filter.field, filter.value);

  // Sort on the server too
  if (sortBy)
    query = query.order(sortBy.field, {
      ascending: sortBy.direction === "asc",
    });

  // Ask for one page only
  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error("Bookings could not be loaded");
  }

  return { data, count };
}

// One booking, with its cabin and guest
export async function getBooking(id) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, cabins(*), guests(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking not found");
  }

  return data;
}

// Sales made since a date
export async function getBookingsAfterDate(date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("created_at, totalPrice, extrasPrice")
    .gte("created_at", date)
    .lte("created_at", getToday({ end: true }));

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Stays starting since a date
export async function getStaysAfterDate(date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, guests(fullName)")
    .gte("startDate", date)
    .lte("startDate", getToday());

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Guests arriving or leaving today
export async function getStaysTodayActivity() {
  const { start, end } = getTodayRange();

  const { data, error } = await supabase
    .from("bookings")
    .select("*, guests(fullName, nationality, countryFlag)")
    // Arriving today: not checked in yet, starts today.
    // Leaving today: checked in, ends today.
    // A range rather than an exact match, so the hour a date was saved
    // with never hides a stay. Done in SQL, so we never download every
    // booking ever made.
    .or(
      `and(status.eq.unconfirmed,startDate.gte.${start},startDate.lte.${end}),and(status.eq.checked-in,endDate.gte.${start},endDate.lte.${end})`
    )
    .order("created_at");

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Change any field on a booking
export async function updateBooking(id, obj) {
  const { data, error } = await supabase
    .from("bookings")
    .update(obj)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }

  return data;
}

// Delete one booking
export async function deleteBooking(id) {
  const { data, error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }

  return data;
}

// Every booking that touches a date range, with its cabin and guest.
// Used by the occupancy calendar. A stay counts if it starts before the range
// ends and finishes after the range starts.
export async function getBookingsInRange(from, to) {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, startDate, endDate, numNights, numGuests, status, totalPrice, cabinId, guests(fullName), cabins(id, name)"
    )
    .lt("startDate", to)
    .gt("endDate", from)
    .neq("status", "cancelled")
    .order("startDate");

  if (error) {
    console.error(error);
    throw new Error("Occupancy could not be loaded");
  }

  return data;
}

// How many bookings sit in each status. Only the status column comes back,
// so this stays cheap even with a few thousand bookings.
export async function getBookingCounts() {
  const { data, error } = await supabase.from("bookings").select("status");

  if (error) {
    console.error(error);
    throw new Error("Booking counts could not be loaded");
  }

  return data.reduce(
    (counts, { status }) => {
      counts[status] = (counts[status] || 0) + 1;
      counts.all += 1;

      return counts;
    },
    { all: 0 }
  );
}
