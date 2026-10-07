// Stay requests, checked against a real Supabase project: only a
// checked-in guest can ask, guests see only their own, staff move requests
// on, and a delivered breakfast adds exactly one charge to the folio.
//
//   npm run test:db

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, format, parseISO } from "date-fns";
import {
  admin,
  cleanUp,
  createPerson,
  createTracker,
  insertBooking,
  run,
  visitor,
} from "./helpers";

const created = createTracker();

let cabin;
let otherCabin;
let menu;
let today;
let staying;
let arriving;
let otherGuest;
let frontDesk;
let stay;

const day = (offset) => format(addDays(parseISO(today), offset), "yyyy-MM-dd");

const ask = (person, type, values = {}) =>
  person.client.rpc("create_stay_request", { p_type: type, ...values });

const extrasOf = async (bookingId) => {
  const { data } = await admin
    .from("booking_folios")
    .select("extras")
    .eq("bookingId", bookingId)
    .single();
  return data.extras;
};

beforeAll(async () => {
  const { data: cabins, error } = await admin
    .from("cabins")
    .insert([
      {
        name: `Req ${run}`,
        maxCapacity: 2,
        regularPrice: 100,
        is_active: true,
      },
      {
        name: `Req2 ${run}`,
        maxCapacity: 2,
        regularPrice: 100,
        is_active: true,
      },
    ])
    .select();
  if (error) throw error;
  [cabin, otherCabin] = cabins;
  created.cabins.push(cabin.id, otherCabin.id);

  ({ data: menu } = await admin
    .from("services")
    .select("id, name, price")
    .eq("category", "menu")
    .order("name"));
  ({ data: today } = await visitor.rpc("property_today"));

  staying = await createPerson(created, "req-staying");
  arriving = await createPerson(created, "req-arriving");
  otherGuest = await createPerson(created, "req-other");
  frontDesk = await createPerson(created, "req-front-desk", "front_desk");

  for (const person of [staying, arriving, otherGuest]) {
    const { data } = await person.client.rpc("ensure_guest_profile");
    person.guestId = data.id;
    created.guests.push(data.id);
  }

  // One guest is checked in today; another only has a reservation ahead
  stay = await insertBooking(created, {
    cabinId: cabin.id,
    guestId: staying.guestId,
    startDate: today,
    endDate: day(3),
  });
  await admin
    .from("bookings")
    .update({ status: "checked_in" })
    .eq("id", stay.id);

  await insertBooking(created, {
    cabinId: otherCabin.id,
    guestId: arriving.guestId,
    startDate: day(10),
    endDate: day(13),
  });
});

afterAll(() => cleanUp(created));

describe("asking for something", () => {
  it("works for a checked-in guest, for their own stay", async () => {
    const { data, error } = await ask(staying, "housekeeping", {
      p_title: "Fresh towels",
      p_note: "Two bath towels, please",
    });

    expect(error).toBe(null);
    expect(data).toMatchObject({
      bookingId: stay.id,
      type: "housekeeping",
      status: "new",
      title: "Fresh towels",
    });
  });

  it("is refused without a checked-in stay", async () => {
    const { error } = await ask(arriving, "support", { p_title: "Wi-Fi" });
    expect(error?.code).toBe("22023");

    const visitorAttempt = await visitor.rpc("create_stay_request", {
      p_type: "support",
      p_title: "Hello",
    });
    expect(visitorAttempt.error).not.toBe(null);
  });

  it("is never a direct write, even for the guest's own stay", async () => {
    const { error } = await staying.client
      .from("requests")
      .insert([{ bookingId: stay.id, type: "support", title: "Sneaky" }]);

    expect(error?.code).toBe("42501");
  });
});

describe("who sees what", () => {
  it("guests see only their own requests", async () => {
    const own = await staying.client.from("requests").select("id");
    const other = await otherGuest.client.from("requests").select("id");

    expect(own.data.length).toBeGreaterThan(0);
    expect(other.data).toEqual([]);
  });

  it("staff see and move requests on; guests can't", async () => {
    const { data: request } = await ask(staying, "maintenance", {
      p_title: "Air conditioning not cooling",
      p_priority: "urgent",
    });
    expect(request.priority).toBe("urgent");

    await staying.client
      .from("requests")
      .update({ status: "completed" })
      .eq("id", request.id);

    const staffView = await frontDesk.client
      .from("requests")
      .select("status")
      .eq("id", request.id)
      .single();
    expect(staffView.data.status).toBe("new");

    const { error } = await frontDesk.client
      .from("requests")
      .update({ status: "in_progress" })
      .eq("id", request.id);
    expect(error).toBe(null);
  });
});

describe("the folio", () => {
  it("gets one charge for a delivered breakfast, at the menu price", async () => {
    const [coffee, eggs] = [
      menu.find((item) => item.name === "Coffee"),
      menu.find((item) => item.name === "Eggs & Toast"),
    ];

    const { data: order, error } = await ask(staying, "breakfast", {
      p_requested_for: "08:30",
      p_items: [
        { serviceId: eggs.id, quantity: 2 },
        { serviceId: coffee.id, quantity: 1 },
      ],
    });
    expect(error).toBe(null);
    expect(order.title).toBe("Eggs & Toast × 2, Coffee × 1");

    const before = await extrasOf(stay.id);
    const move = (status) =>
      frontDesk.client.from("requests").update({ status }).eq("id", order.id);

    await move("in_progress");
    expect(await extrasOf(stay.id)).toBe(before);

    expect((await move("completed")).error).toBe(null);
    expect(await extrasOf(stay.id)).toBe(
      before + eggs.price * 2 + coffee.price,
    );

    // Completed stays completed, so it can never be charged again
    expect((await move("in_progress")).error?.code).toBe("22023");

    const { data: charges } = await admin
      .from("charges")
      .select("amount")
      .eq("requestId", order.id);
    expect(charges).toEqual([{ amount: eggs.price * 2 + coffee.price }]);
  });

  it("is left alone by a free request", async () => {
    const { data: request } = await ask(staying, "support", {
      p_title: "Late checkout question",
    });
    const before = await extrasOf(stay.id);

    await frontDesk.client
      .from("requests")
      .update({ status: "completed" })
      .eq("id", request.id);

    expect(await extrasOf(stay.id)).toBe(before);
  });
});

describe("after checkout", () => {
  it("no new requests can be made", async () => {
    await frontDesk.client
      .from("bookings")
      .update({ status: "checked_out" })
      .eq("id", stay.id);

    const { error } = await ask(staying, "housekeeping", {
      p_title: "Fresh towels",
    });
    expect(error?.code).toBe("22023");

    // What was asked during the stay is still there to read
    const { data } = await staying.client.from("requests").select("id");
    expect(data.length).toBeGreaterThan(0);
  });
});
