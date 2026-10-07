import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

// bookings_search is a view that puts the guest name, guest email and cabin
// name on the booking row, so one search box can match any of them and the
// filtering still happens on the server.
const COLUMNS =
  "id, reference, created_at, startDate, endDate, numNights, numGuests, status, source, totalPrice, isPaid, observations, cabinId, guest_name, guest_email, cabin_name";

// The view returns flat columns. The table expects the shape the old query
// gave it, so put the nested objects back here and leave the UI alone.
function toBooking(row) {
  return {
    ...row,
    cabins: { id: row.cabinId, name: row.cabin_name },
    guests: { fullName: row.guest_name, email: row.guest_email },
  };
}

export async function getBookings({ filter, sortBy, page, search }) {
  let query = supabase
    .from("bookings_search")
    .select(COLUMNS, { count: "exact" });

  if (filter) query = query.eq(filter.field, filter.value);

  if (search) {
    const term = `%${search}%`;
    const byId = Number(search);

    const conditions = [
      `guest_name.ilike.${term}`,
      `guest_email.ilike.${term}`,
      `cabin_name.ilike.${term}`,
      `reference.ilike.${term}`,
    ];

    // Typing a number should also find that booking by its id
    if (Number.isInteger(byId)) conditions.push(`id.eq.${byId}`);

    query = query.or(conditions.join(","));
  }

  if (sortBy)
    query = query.order(sortBy.field, {
      ascending: sortBy.direction === "asc",
    });

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error("Bookings could not be loaded");
  }

  return { data: data.map(toBooking), count };
}
