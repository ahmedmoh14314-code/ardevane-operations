import { getToday, todayISO } from "../utils/helpers";
import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

// When the database refuses a booking it says why, in plain words (code
// 22023 or P0002). Anything else gets the general message.
function bookingError(error, fallback) {
  console.error(error);

  const isReadable = ["22023", "P0002", "42501"].includes(error.code);

  return new Error(isReadable ? error.message : fallback);
}

// One page of bookings, filtered and sorted
export async function getBookings({ filter, sortBy, page }) {
  let query = supabase.from("bookings").select(
    "id, reference, created_at, startDate, endDate, numNights, numGuests, status, source, totalPrice, cabins(name), guests(fullName, email)",
    // count tells the pagination how many rows exist
    { count: "exact" },
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
    .select("created_at, totalPrice")
    .gte("created_at", date)
    .lte("created_at", getToday({ end: true }));

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Stays starting since a day ("2026-11-02")
export async function getStaysAfterDate(day) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, guests(fullName)")
    .gte("startDate", day)
    .lte("startDate", todayISO());

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Everything the desk works from today: arrivals, and every stay that is
// checked in (some of them leave today). Each comes with its folio, so the
// desk can see what is still owed.
export async function getTodayBoard() {
  const today = todayISO();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, reference, status, startDate, endDate, numNights, numGuests, cabinId, guests(fullName, nationality, countryFlag), cabins(name)",
    )
    .or(`and(status.eq.reserved,startDate.eq.${today}),status.eq.checked_in`)
    .order("startDate");

  if (error) {
    console.error(error);
    throw new Error("Today's bookings could not be loaded");
  }

  if (!bookings.length) return [];

  const { data: folios, error: folioError } = await supabase
    .from("booking_folios")
    .select("bookingId, total, paid, remaining")
    .in(
      "bookingId",
      bookings.map((booking) => booking.id),
    );

  if (folioError) {
    console.error(folioError);
    throw new Error("Today's bookings could not be loaded");
  }

  return bookings.map((booking) => ({
    ...booking,
    folio: folios.find((folio) => folio.bookingId === booking.id),
  }));
}

// Change any field on a booking
export async function updateBooking(id, obj) {
  const { data, error } = await supabase
    .from("bookings")
    .update(obj)
    .eq("id", id)
    .select()
    .single();

  if (error) throw bookingError(error, "Booking could not be updated");

  return data;
}

// Cancelling keeps the booking, marked cancelled, with when and who
export async function cancelBooking(id) {
  const { data, error } = await supabase.rpc("cancel_booking", {
    p_booking_id: id,
  });

  if (error) throw bookingError(error, "Booking could not be cancelled");

  return data;
}

// The price and every rule for a stay, before anyone commits to it
export async function quoteBooking({ cabinId, startDate, endDate, numGuests }) {
  const { data, error } = await supabase.rpc("quote_booking", {
    p_cabin_id: cabinId,
    p_start_date: startDate,
    p_end_date: endDate,
    p_num_guests: numGuests,
  });

  if (error) throw bookingError(error, "This stay could not be priced");

  return data[0];
}

// A walk-in or phone booking. The same database rules as the guest
// website: the database works out the price and refuses taken nights.
export async function createStaffBooking({
  cabinId,
  startDate,
  endDate,
  numGuests,
  source,
  guestFullName,
  guestEmail,
  observations,
}) {
  const { data, error } = await supabase.rpc("create_staff_booking", {
    p_cabin_id: cabinId,
    p_start_date: startDate,
    p_end_date: endDate,
    p_num_guests: numGuests,
    p_source: source,
    p_guest_full_name: guestFullName,
    p_guest_email: guestEmail,
    p_observations: observations,
  });

  if (error) throw bookingError(error, "Booking could not be created");

  return data;
}

// Every live booking that touches a range of days, with its cabin and guest.
// Used by the occupancy calendar. A stay counts if it starts before the range
// ends and finishes after the range starts.
export async function getBookingsInRange(from, to) {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, startDate, endDate, numNights, numGuests, status, totalPrice, cabinId, guests(fullName), cabins(id, name)",
    )
    .lt("startDate", to)
    .gt("endDate", from)
    .not("status", "in", "(cancelled,no_show)")
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
    { all: 0 },
  );
}

// Bookings made on the website that wait for the hotel's answer, oldest
// first
export async function getBookingRequests() {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, reference, created_at, startDate, endDate, numNights, numGuests, totalPrice, observations, cabins(name, image), guests(fullName, email)",
    )
    .eq("status", "pending")
    .order("created_at");

  if (error) {
    console.error(error);
    throw new Error("Booking requests could not be loaded");
  }

  return data;
}

// Accept a booking request: it becomes a normal reservation
export async function approveBooking(id) {
  return updateBooking(id, { status: "reserved" });
}
