// Booking rules, checked against a real Supabase project: prices, stay
// lengths, capacity, overlaps, cancelling, the status rules and walk-in
// bookings by staff. Everything happens on a temporary cabin, so real stays
// are never touched.
//
//   npm run test:db

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, format, parseISO } from "date-fns";
import {
  admin,
  cleanUp,
  createPerson,
  createTracker,
  farFuture,
  insertBooking,
  run,
  visitor,
} from "./helpers";

const created = createTracker();

let cabin;
let settings;
let today;
let guestA;
let guestB;
let frontDesk;
let boss;

// Today plus a number of days, as "yyyy-MM-dd"
const day = (offset) => format(addDays(parseISO(today), offset), "yyyy-MM-dd");

const book = (person, start, end, guests = 2, notes) =>
  person.client.rpc("create_booking", {
    p_cabin_id: cabin.id,
    p_start_date: start,
    p_end_date: end,
    p_num_guests: guests,
    p_observations: notes,
  });

const track = (booking) => {
  if (booking) created.bookings.push(booking.id);
  return booking;
};

beforeAll(async () => {
  const { data: newCabin, error } = await admin
    .from("cabins")
    .insert([
      {
        name: `Test ${run}`,
        maxCapacity: 4,
        regularPrice: 120,
        discount: 20,
        is_active: true,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  cabin = newCabin;
  created.cabins.push(cabin.id);

  ({ data: settings } = await admin.from("settings").select("*").single());
  ({ data: today } = await visitor.rpc("property_today"));

  guestA = await createPerson(created, "book-guest-a");
  guestB = await createPerson(created, "book-guest-b");
  frontDesk = await createPerson(created, "book-front-desk", "front_desk");
  boss = await createPerson(created, "book-admin", "admin");

  for (const person of [guestA, guestB]) {
    const { data } = await person.client.rpc("ensure_guest_profile");
    person.guestId = data.id;
    created.guests.push(data.id);
  }
});

afterAll(() => cleanUp(created));

describe("a quote, signed out", () => {
  it("prices the nights from the cabin, discount included", async () => {
    const { data, error } = await visitor.rpc("quote_booking", {
      p_cabin_id: cabin.id,
      p_start_date: farFuture(1, 10),
      p_end_date: farFuture(1, 14),
      p_num_guests: 2,
    });

    expect(error).toBeNull();
    expect(data).toEqual([{ nights: 4, nightly_price: 100, total_price: 400 }]);
  });

  it("refuses stays that break the house rules", async () => {
    const quote = (start, end, guests) =>
      visitor.rpc("quote_booking", {
        p_cabin_id: cabin.id,
        p_start_date: start,
        p_end_date: end,
        p_num_guests: guests,
      });

    const tooShort = await quote(day(10), day(10 + settings.minBookingLength - 1), 2);
    expect(tooShort.error.message).toMatch(/at least/);

    const tooLong = await quote(day(10), day(10 + settings.maxBookingLength + 1), 2);
    expect(tooLong.error.message).toMatch(/at most/);

    const tooMany = await quote(day(10), day(14), 5);
    expect(tooMany.error.message).toMatch(/sleeps up to 4/);

    const past = await quote(day(-3), day(2), 2);
    expect(past.error.message).toMatch(/already passed/);
  });

  it("refuses a cabin that is archived", async () => {
    await admin.from("cabins").update({ is_active: false }).eq("id", cabin.id);

    const { error } = await visitor.rpc("quote_booking", {
      p_cabin_id: cabin.id,
      p_start_date: farFuture(1, 10),
      p_end_date: farFuture(1, 14),
      p_num_guests: 2,
    });

    await admin.from("cabins").update({ is_active: true }).eq("id", cabin.id);

    expect(error.message).toMatch(/not open for booking/);
  });

  it("can't book without signing in", async () => {
    const { error } = await visitor.rpc("create_booking", {
      p_cabin_id: cabin.id,
      p_start_date: farFuture(1, 10),
      p_end_date: farFuture(1, 14),
      p_num_guests: 2,
    });

    expect(error).not.toBeNull();
  });
});

describe("a guest booking for themselves", () => {
  it("gets a reservation with a reference and the server's price", async () => {
    const { data, error } = await book(
      guestA,
      farFuture(2, 1),
      farFuture(2, 5),
      2,
      "Arriving late"
    );
    track(data);

    expect(error).toBeNull();
    expect(data.reference).toMatch(/^ARD-[A-HJKMNP-Z2-9]{6}$/);
    expect(data).toMatchObject({
      status: "reserved",
      numNights: 4,
      totalPrice: 400,
      guestId: guestA.guestId,
      source: "website",
      createdBy: guestA.id,
      observations: "Arriving late",
    });
  });

  it("is the only one who sees it", async () => {
    const { data: mine } = await guestA.client
      .from("bookings")
      .select("id")
      .eq("cabinId", cabin.id);
    const { data: theirs } = await guestB.client
      .from("bookings")
      .select("id")
      .eq("cabinId", cabin.id);

    expect(mine.length).toBeGreaterThan(0);
    expect(theirs).toEqual([]);
  });

  it("can't take nights someone else already has", async () => {
    const { error } = await book(guestB, farFuture(2, 3), farFuture(2, 7));

    expect(error.message).toMatch(/already booked/);
  });

  it("can arrive on the day the last guest leaves", async () => {
    const { data, error } = await book(guestB, farFuture(2, 5), farFuture(2, 9));
    track(data);

    expect(error).toBeNull();
  });

  it("lets exactly one of two simultaneous bookings through", async () => {
    const results = await Promise.all([
      book(guestA, farFuture(3, 1), farFuture(3, 5)),
      book(guestB, farFuture(3, 1), farFuture(3, 5)),
    ]);
    results.forEach(({ data }) => track(data));

    expect(results.filter(({ error }) => !error)).toHaveLength(1);
  });
});

describe("changing and cancelling", () => {
  let booking;

  beforeAll(async () => {
    ({ data: booking } = await book(guestA, farFuture(4, 1), farFuture(4, 5)));
    track(booking);
  });

  it("a guest changes the number of guests within the cabin's limit", async () => {
    const ok = await guestA.client.rpc("update_booking", {
      p_booking_id: booking.id,
      p_num_guests: 4,
      p_observations: "One more",
    });
    expect(ok.error).toBeNull();
    expect(ok.data.numGuests).toBe(4);

    const tooMany = await guestA.client.rpc("update_booking", {
      p_booking_id: booking.id,
      p_num_guests: 5,
    });
    expect(tooMany.error.message).toMatch(/sleeps up to 4/);
  });

  it("nobody changes or cancels someone else's reservation", async () => {
    const update = await guestB.client.rpc("update_booking", {
      p_booking_id: booking.id,
      p_num_guests: 1,
    });
    const cancel = await guestB.client.rpc("cancel_booking", {
      p_booking_id: booking.id,
    });

    expect(update.error.message).toMatch(/not found/);
    expect(cancel.error.message).toMatch(/not found/);
  });

  it("cancelling keeps the booking and frees the nights", async () => {
    const { data, error } = await guestA.client.rpc("cancel_booking", {
      p_booking_id: booking.id,
    });

    expect(error).toBeNull();
    expect(data.status).toBe("cancelled");
    expect(data.cancelledAt).not.toBeNull();
    expect(data.cancelledBy).toBe(guestA.id);

    const { data: stillThere } = await admin
      .from("bookings")
      .select("id")
      .eq("id", booking.id);
    expect(stillThere).toHaveLength(1);

    const again = await book(guestB, farFuture(4, 1), farFuture(4, 5));
    track(again.data);
    expect(again.error).toBeNull();
  });

  it("a guest can't cancel online on the arrival day", async () => {
    const arriving = await insertBooking(created, {
      cabinId: cabin.id,
      guestId: guestA.guestId,
      startDate: day(0),
      endDate: day(3),
    });

    const { error } = await guestA.client.rpc("cancel_booking", {
      p_booking_id: arriving.id,
    });
    expect(error.message).toMatch(/closes the day before arrival/);

    // The front desk still can
    const staff = await frontDesk.client.rpc("cancel_booking", {
      p_booking_id: arriving.id,
    });
    expect(staff.error).toBeNull();
  });
});

describe("the status rules", () => {
  it("check in from the arrival day, then check out", async () => {
    // A late arrival: the stay began three days ago
    const stay = await insertBooking(created, {
      cabinId: cabin.id,
      guestId: guestB.guestId,
      startDate: day(-3),
      endDate: day(0),
    });

    const checkIn = await frontDesk.client
      .from("bookings")
      .update({ status: "checked_in" })
      .eq("id", stay.id)
      .select();
    expect(checkIn.error).toBeNull();

    const cancel = await guestB.client.rpc("cancel_booking", {
      p_booking_id: stay.id,
    });
    expect(cancel.error.message).toMatch(/hasn't started/);

    const checkOut = await frontDesk.client
      .from("bookings")
      .update({ status: "checked_out" })
      .eq("id", stay.id)
      .select();
    expect(checkOut.error).toBeNull();

    const back = await frontDesk.client
      .from("bookings")
      .update({ status: "reserved" })
      .eq("id", stay.id);
    expect(back.error.message).toMatch(/can't become reserved/);
  });

  it("no check in or no-show before the arrival day", async () => {
    const future = await insertBooking(created, {
      cabinId: cabin.id,
      guestId: guestB.guestId,
      startDate: farFuture(6, 1),
      endDate: farFuture(6, 4),
    });

    for (const status of ["checked_in", "no_show"]) {
      const { error } = await frontDesk.client
        .from("bookings")
        .update({ status })
        .eq("id", future.id);
      expect(error.message).toMatch(/only starts on/);
    }

    const skip = await frontDesk.client
      .from("bookings")
      .update({ status: "checked_out" })
      .eq("id", future.id);
    expect(skip.error.message).toMatch(/can't become checked out/);
  });

  it("a no-show frees the nights", async () => {
    const missed = await insertBooking(created, {
      cabinId: cabin.id,
      guestId: guestA.guestId,
      startDate: day(0),
      endDate: day(4),
    });

    const { error } = await frontDesk.client
      .from("bookings")
      .update({ status: "no_show" })
      .eq("id", missed.id);
    expect(error).toBeNull();

    const quote = await visitor.rpc("quote_booking", {
      p_cabin_id: cabin.id,
      p_start_date: day(1),
      p_end_date: day(4),
      p_num_guests: 2,
    });
    expect(quote.error).toBeNull();
  });
});

describe("walk-in and phone bookings", () => {
  const staffBook = (person, values) =>
    person.client.rpc("create_staff_booking", {
      p_cabin_id: cabin.id,
      p_num_guests: 2,
      p_source: "phone",
      ...values,
    });

  it("the front desk books a new guest by phone", async () => {
    const email = `test-phone-${run}@example.com`;

    const { data, error } = await staffBook(frontDesk, {
      p_start_date: farFuture(7, 1),
      p_end_date: farFuture(7, 4),
      p_guest_full_name: "Phone Guest",
      p_guest_email: email,
      p_observations: "Called from the airport",
    });
    track(data);

    expect(error).toBeNull();
    expect(data).toMatchObject({
      source: "phone",
      createdBy: frontDesk.id,
      totalPrice: 300,
      status: "reserved",
    });

    const { data: guest } = await admin
      .from("guests")
      .select("id, fullName, email")
      .eq("id", data.guestId)
      .single();
    created.guests.push(guest.id);
    expect(guest).toMatchObject({ fullName: "Phone Guest", email });
  });

  it("walk-ins follow exactly the same rules", async () => {
    const overlap = await staffBook(frontDesk, {
      p_source: "walk_in",
      p_start_date: farFuture(7, 2),
      p_end_date: farFuture(7, 6),
      p_guest_id: guestA.guestId,
    });
    expect(overlap.error.message).toMatch(/already booked/);

    const tooMany = await staffBook(frontDesk, {
      p_source: "walk_in",
      p_start_date: farFuture(8, 1),
      p_end_date: farFuture(8, 4),
      p_num_guests: 5,
      p_guest_id: guestA.guestId,
    });
    expect(tooMany.error.message).toMatch(/sleeps up to 4/);

    const ok = await staffBook(frontDesk, {
      p_source: "walk_in",
      p_start_date: farFuture(8, 1),
      p_end_date: farFuture(8, 4),
      p_guest_id: guestA.guestId,
    });
    track(ok.data);
    expect(ok.error).toBeNull();
    expect(ok.data.guestId).toBe(guestA.guestId);
  });

  it("a guest can't use the staff booking", async () => {
    const { error } = await staffBook(guestA, {
      p_start_date: farFuture(9, 1),
      p_end_date: farFuture(9, 4),
      p_guest_id: guestB.guestId,
    });

    expect(error.message).toMatch(/Only staff/);
  });
});

describe("removing a booking", () => {
  it("nobody inserts directly, and only an admin may delete", async () => {
    const insert = await frontDesk.client.from("bookings").insert([
      {
        cabinId: cabin.id,
        guestId: guestA.guestId,
        startDate: farFuture(10, 1),
        endDate: farFuture(10, 4),
        numGuests: 1,
        cabinPrice: 1,
        totalPrice: 1,
      },
    ]);
    expect(insert.error).not.toBeNull();

    const doomed = await insertBooking(created, {
      cabinId: cabin.id,
      guestId: guestA.guestId,
      startDate: farFuture(11, 1),
      endDate: farFuture(11, 4),
    });

    const byFrontDesk = await frontDesk.client
      .from("bookings")
      .delete()
      .eq("id", doomed.id)
      .select();
    expect(byFrontDesk.data ?? []).toEqual([]);

    const byAdmin = await boss.client
      .from("bookings")
      .delete()
      .eq("id", doomed.id)
      .select();
    expect(byAdmin.data).toHaveLength(1);
  });
});
