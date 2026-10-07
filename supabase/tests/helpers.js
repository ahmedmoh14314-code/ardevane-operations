// Shared set-up for the database tests: real accounts on a real project,
// created for one run and removed again at the end.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

const options = { auth: { persistSession: false, autoRefreshToken: false } };

// The secret key skips every policy: it sets the scene and cleans up
export const admin = createClient(url, secretKey, options);
export const visitor = createClient(url, publishableKey, options);

export const run = Date.now().toString(36);

// Everything a test file creates, so cleanUp() can remove it
export function createTracker() {
  return { users: [], guests: [], cabins: [], bookings: [], files: [] };
}

// A real sign-in account, optionally on the team, already signed in
export async function createPerson(tracker, label, staffRole) {
  const email = `test-${label}-${run}@example.com`;
  const password = `${crypto.randomUUID()}A1`;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `Test ${label}` },
  });
  if (error) throw error;

  tracker.users.push(data.user.id);

  if (staffRole) {
    const { error: staffError } = await admin
      .from("staff_members")
      .insert([{ userId: data.user.id, fullName: label, role: staffRole }]);
    if (staffError) throw staffError;
  }

  const client = createClient(url, publishableKey, options);
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) throw signInError;

  return { id: data.user.id, email, password, client };
}

// A booking straight into the table, for setting the scene. Real bookings
// go through create_booking; this is only for tests.
export async function insertBooking(tracker, values) {
  const nights =
    (new Date(values.endDate) - new Date(values.startDate)) / 86400000;

  const { data, error } = await admin
    .from("bookings")
    .insert([
      {
        numGuests: 1,
        cabinPrice: nights * 100,
        totalPrice: nights * 100,
        status: "reserved",
        ...values,
      },
    ])
    .select()
    .single();
  if (error) throw error;

  tracker.bookings.push(data.id);

  return data;
}

export async function cleanUp(tracker) {
  if (tracker.files.length)
    await admin.storage.from("cabin-images").remove(tracker.files);
  if (tracker.bookings.length)
    await admin.from("bookings").delete().in("id", tracker.bookings);
  if (tracker.guests.length)
    await admin.from("guests").delete().in("id", tracker.guests);
  if (tracker.cabins.length)
    await admin.from("cabins").delete().in("id", tracker.cabins);
  for (const id of tracker.users) await admin.auth.admin.deleteUser(id);
}

// "2099-03-01" style dates, so tests never collide with real stays
export function farFuture(month, day) {
  return `2099-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
