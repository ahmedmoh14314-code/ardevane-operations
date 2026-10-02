import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

// Every guest query pulls the bookings with it, because a guest is only
// interesting next to their stays. 24 bookings total, so this is one round
// trip, not an N+1.
const GUEST_WITH_BOOKINGS =
  "*, bookings(id, startDate, endDate, numNights, totalPrice, status, cabins(id, name))";

// One page of guests, searched and sorted on the server
export async function getGuests({ search, sortBy, page }) {
  let query = supabase
    .from("guests")
    .select(GUEST_WITH_BOOKINGS, { count: "exact" });

  if (search) {
    const term = `%${search}%`;
    query = query.or(
      `fullName.ilike.${term},email.ilike.${term},nationality.ilike.${term}`
    );
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
    throw new Error("Guests could not be loaded");
  }

  return { data: data.map(withStats), count };
}

// One guest and their whole history
export async function getGuest(id) {
  const { data, error } = await supabase
    .from("guests")
    .select(GUEST_WITH_BOOKINGS)
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Guest not found");
  }

  return withStats(data);
}

// Derived numbers, computed from the bookings we already fetched.
// Cancelled stays are not counted as revenue.
export function withStats(guest) {
  const bookings = guest.bookings ?? [];
  const counted = bookings.filter((b) => b.status !== "cancelled");

  const now = Date.now();
  const sorted = [...bookings].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  // The stay happening right now, or the next one booked
  const current = sorted.find(
    (b) => new Date(b.startDate) <= now && new Date(b.endDate) >= now
  );
  const upcoming = sorted.find((b) => new Date(b.startDate) > now);

  return {
    ...guest,
    bookings: sorted,
    stats: {
      stays: counted.length,
      nights: counted.reduce((sum, b) => sum + (b.numNights ?? 0), 0),
      spend: counted.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0),
      currentStay: current ?? null,
      upcomingStay: upcoming ?? null,
      lastStay: [...sorted].reverse().find((b) => new Date(b.endDate) < now) ?? null,
    },
  };
}
