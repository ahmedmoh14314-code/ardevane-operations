// The stay folio, checked against a real Supabase project: charges add to
// the total, cash payments come off what is owed, only staff can write to
// a folio, and checking in or out has nothing to do with payment.
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
let breakfast;
let guest;
let otherGuest;
let frontDesk;
let booking;

const folioOf = (client, bookingId) =>
  client
    .from("booking_folios")
    .select("accommodation, extras, total, paid, remaining")
    .eq("bookingId", bookingId)
    .maybeSingle();

beforeAll(async () => {
  const { data: newCabin, error } = await admin
    .from("cabins")
    .insert([
      {
        name: `Folio ${run}`,
        maxCapacity: 4,
        regularPrice: 100,
        discount: 0,
        is_active: true,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  cabin = newCabin;
  created.cabins.push(cabin.id);

  ({ data: breakfast } = await admin
    .from("services")
    .select("id, name, price")
    .eq("name", "Breakfast")
    .single());

  guest = await createPerson(created, "folio-guest");
  otherGuest = await createPerson(created, "folio-other-guest");
  frontDesk = await createPerson(created, "folio-front-desk", "front_desk");

  for (const person of [guest, otherGuest]) {
    const { data } = await person.client.rpc("ensure_guest_profile");
    person.guestId = data.id;
    created.guests.push(data.id);
  }

  // Three nights at 100, booked by the guest the normal way
  const { data, error: bookingError } = await guest.client.rpc(
    "create_booking",
    {
      p_cabin_id: cabin.id,
      p_start_date: farFuture(5, 1),
      p_end_date: farFuture(5, 4),
      p_num_guests: 2,
    },
  );
  if (bookingError) throw bookingError;
  booking = data;
  created.bookings.push(booking.id);
});

afterAll(() => cleanUp(created));

describe("a new booking", () => {
  it("is priced on the nights alone, with no breakfast in it", () => {
    expect(booking.totalPrice).toBe(300);
    expect(booking.extrasPrice).toBe(0);
    expect(booking.hasBreakfast).toBe(false);
  });

  it("starts with an empty folio: everything still to pay", async () => {
    const { data } = await folioOf(frontDesk.client, booking.id);

    expect(data).toEqual({
      accommodation: 300,
      extras: 0,
      total: 300,
      paid: 0,
      remaining: 300,
    });
  });
});

describe("the front desk", () => {
  it("adds a charge, which raises the total", async () => {
    const { error } = await frontDesk.client.from("charges").insert([
      {
        bookingId: booking.id,
        serviceId: breakfast.id,
        description: breakfast.name,
        amount: breakfast.price,
      },
    ]);
    expect(error).toBe(null);

    const { error: customError } = await frontDesk.client
      .from("charges")
      .insert([
        { bookingId: booking.id, description: "Late checkout", amount: 25 },
      ]);
    expect(customError).toBe(null);

    const { data } = await folioOf(frontDesk.client, booking.id);
    expect(data.extras).toBe(breakfast.price + 25);
    expect(data.total).toBe(300 + breakfast.price + 25);
  });

  it("records cash, which comes off what is owed", async () => {
    const { data: before } = await folioOf(frontDesk.client, booking.id);

    const { error } = await frontDesk.client
      .from("payments")
      .insert([{ bookingId: booking.id, amount: 100 }]);
    expect(error).toBe(null);

    const { data: after } = await folioOf(frontDesk.client, booking.id);
    expect(after.total).toBe(before.total);
    expect(after.paid).toBe(100);
    expect(after.remaining).toBe(before.total - 100);
  });

  it("can't record a zero or negative amount, or anything but cash", async () => {
    const attempts = await Promise.all([
      frontDesk.client
        .from("charges")
        .insert([{ bookingId: booking.id, description: "Nothing", amount: 0 }]),
      frontDesk.client
        .from("payments")
        .insert([{ bookingId: booking.id, amount: -5 }]),
      frontDesk.client
        .from("payments")
        .insert([{ bookingId: booking.id, amount: 10, method: "card" }]),
    ]);

    for (const { error } of attempts) expect(error?.code).toBe("23514");
  });

  it("can't write a charge in someone else's name", async () => {
    const { error } = await frontDesk.client.from("charges").insert([
      {
        bookingId: booking.id,
        description: "Laundry",
        amount: 20,
        createdBy: guest.id,
      },
    ]);

    expect(error?.code).toBe("42501");
  });
});

describe("guests", () => {
  it("can't add a charge or a payment, even on their own stay", async () => {
    const charge = await guest.client
      .from("charges")
      .insert([
        { bookingId: booking.id, description: "Free stuff", amount: 1 },
      ]);
    const payment = await guest.client
      .from("payments")
      .insert([{ bookingId: booking.id, amount: 1000 }]);

    expect(charge.error?.code).toBe("42501");
    expect(payment.error?.code).toBe("42501");

    const { data } = await folioOf(frontDesk.client, booking.id);
    expect(data.paid).toBe(100);
  });

  it("can't change or remove a charge or a payment on their own stay", async () => {
    const before = await folioOf(frontDesk.client, booking.id);

    await guest.client
      .from("charges")
      .update({ amount: 1 })
      .eq("bookingId", booking.id);
    await guest.client.from("charges").delete().eq("bookingId", booking.id);
    await guest.client
      .from("payments")
      .update({ amount: 99999 })
      .eq("bookingId", booking.id);
    await guest.client.from("payments").delete().eq("bookingId", booking.id);

    const after = await folioOf(frontDesk.client, booking.id);
    expect(after.data).toEqual(before.data);
  });

  it("see the folio of their own stay, and no one else's", async () => {
    const own = await folioOf(guest.client, booking.id);
    const staffView = await folioOf(frontDesk.client, booking.id);
    expect(own.data).toEqual(staffView.data);

    const other = await folioOf(otherGuest.client, booking.id);
    expect(other.data).toBe(null);

    const { data: charges } = await otherGuest.client
      .from("charges")
      .select("id")
      .eq("bookingId", booking.id);
    expect(charges).toEqual([]);
  });

  it("visitors see no services, charges or payments", async () => {
    for (const table of ["services", "charges", "payments"]) {
      const { data, error } = await visitor.from(table).select("id").limit(1);
      expect(data ?? []).toEqual([]);
      if (error) expect(error.code).toBe("42501");
    }
  });
});

describe("checking in and out", () => {
  it("leaves the folio alone: nothing is marked paid, and owing doesn't block checkout", async () => {
    const { data: today } = await visitor.rpc("property_today");
    const arriving = await insertBooking(created, {
      cabinId: cabin.id,
      guestId: guest.guestId,
      startDate: today,
      endDate: format(addDays(parseISO(today), 3), "yyyy-MM-dd"),
    });

    const checkIn = await frontDesk.client
      .from("bookings")
      .update({ status: "checked_in" })
      .eq("id", arriving.id);
    expect(checkIn.error).toBe(null);

    const { data: afterCheckIn } = await folioOf(frontDesk.client, arriving.id);
    expect(afterCheckIn.paid).toBe(0);
    expect(afterCheckIn.remaining).toBe(arriving.totalPrice);

    const checkOut = await frontDesk.client
      .from("bookings")
      .update({ status: "checked_out" })
      .eq("id", arriving.id)
      .select("status")
      .single();
    expect(checkOut.data.status).toBe("checked_out");
  });
});
