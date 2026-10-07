// Cabin condition, checked against a real Supabase project: checkout makes
// the cabin dirty, staff move it on from there, and nobody else can.
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
let guest;
let frontDesk;
let housekeeping;

const conditionOf = async (cabinId) => {
  const { data } = await admin
    .from("cabins")
    .select("condition")
    .eq("id", cabinId)
    .single();
  return data.condition;
};

beforeAll(async () => {
  const { data, error } = await admin
    .from("cabins")
    .insert([
      {
        name: `Ops ${run}`,
        maxCapacity: 2,
        regularPrice: 100,
        discount: 0,
        is_active: true,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  cabin = data;
  created.cabins.push(cabin.id);

  guest = await createPerson(created, "ops-guest");
  frontDesk = await createPerson(created, "ops-front-desk", "front_desk");
  housekeeping = await createPerson(
    created,
    "ops-housekeeping",
    "housekeeping",
  );

  const { data: profile } = await guest.client.rpc("ensure_guest_profile");
  guest.guestId = profile.id;
  created.guests.push(profile.id);
});

afterAll(() => cleanUp(created));

describe("cabin condition", () => {
  it("starts ready", () => {
    expect(cabin.condition).toBe("ready");
  });

  it("becomes dirty when the guest checks out", async () => {
    const { data: today } = await visitor.rpc("property_today");
    const stay = await insertBooking(created, {
      cabinId: cabin.id,
      guestId: guest.guestId,
      startDate: today,
      endDate: format(addDays(parseISO(today), 2), "yyyy-MM-dd"),
    });

    const update = (status) =>
      frontDesk.client.from("bookings").update({ status }).eq("id", stay.id);

    expect((await update("checked_in")).error).toBe(null);
    expect(await conditionOf(cabin.id)).toBe("ready");

    expect((await update("checked_out")).error).toBe(null);
    expect(await conditionOf(cabin.id)).toBe("dirty");
  });

  it("is moved on by staff: dirty → cleaning → ready, and out of service", async () => {
    for (const condition of ["cleaning", "ready", "out_of_service", "ready"]) {
      const { error } = await housekeeping.client
        .from("cabins")
        .update({ condition })
        .eq("id", cabin.id);

      expect(error).toBe(null);
      expect(await conditionOf(cabin.id)).toBe(condition);
    }
  });

  it("has no 'occupied': only the four conditions are allowed", async () => {
    const { error } = await frontDesk.client
      .from("cabins")
      .update({ condition: "occupied" })
      .eq("id", cabin.id);

    expect(error?.code).toBe("23514");
  });

  it("can't be changed by a guest", async () => {
    await guest.client
      .from("cabins")
      .update({ condition: "out_of_service" })
      .eq("id", cabin.id);

    expect(await conditionOf(cabin.id)).toBe("ready");
  });
});
