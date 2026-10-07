// Access rules, checked against a real Supabase project.
//
// Every test signs in as a real person: a visitor who is signed out, two
// guests, a front desk employee and an admin. The accounts and rows are
// created for the run and removed again at the end.
//
//   npm run test:db
//
// Needs SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY in
// .env.test.local. Point it at a development project, never at real guests.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
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
const signUpPerson = (label, staffRole) =>
  createPerson(created, `access-${label}`, staffRole);

let openCabin;
let archivedCabin;
let guestA;
let guestB;
let guestAProfile;
let knownGuestId;
let frontDesk;
let boss;

beforeAll(async () => {
  const { data: cabins } = await admin
    .from("cabins")
    .select("*")
    .eq("is_active", true)
    .limit(1);
  openCabin = cabins[0];

  const { data: archived, error } = await admin
    .from("cabins")
    .insert([
      {
        name: `Archived ${run}`,
        maxCapacity: 2,
        regularPrice: 100,
        discount: 0,
        image: openCabin.image,
        is_active: false,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  archivedCabin = archived;
  created.cabins.push(archived.id);

  await admin
    .from("cabin_images")
    .insert([{ cabinId: archived.id, url: openCabin.image, position: 0 }]);

  guestA = await signUpPerson("guest-a");
  guestB = await signUpPerson("guest-b");
  frontDesk = await signUpPerson("front-desk", "front_desk");
  boss = await signUpPerson("admin", "admin");

  // Guest B was booked in by phone before ever signing up
  const { data: known } = await admin
    .from("guests")
    .insert([{ fullName: "Access guest B", email: guestB.email }])
    .select()
    .single();
  knownGuestId = known.id;
  created.guests.push(known.id);

  const { data: profile, error: profileError } =
    await guestA.client.rpc("ensure_guest_profile");
  if (profileError) throw profileError;
  guestAProfile = profile;
  created.guests.push(profile.id);

  await insertBooking(created, {
    cabinId: openCabin.id,
    guestId: guestAProfile.id,
    startDate: farFuture(3, 1),
    endDate: farFuture(3, 4),
  });
});

afterAll(() => cleanUp(created));

describe("a visitor who is signed out", () => {
  it("sees open cabins and their photos, never archived ones", async () => {
    const { data: cabins } = await visitor.from("cabins").select("id, is_active");
    expect(cabins.length).toBeGreaterThan(0);
    expect(cabins.every((cabin) => cabin.is_active)).toBe(true);

    const { data: photos } = await visitor
      .from("cabin_images")
      .select("id")
      .eq("cabinId", archivedCabin.id);
    expect(photos).toEqual([]);
  });

  it("reads the house rules", async () => {
    const { data } = await visitor.from("settings").select("minBookingLength");
    expect(data).toHaveLength(1);
  });

  it("sees no guests, bookings or staff", async () => {
    for (const table of ["guests", "bookings", "staff_members"]) {
      const { data } = await visitor.from(table).select("*");
      expect(data ?? []).toEqual([]);
    }

    const { error } = await visitor.from("bookings_search").select("id");
    expect(error).not.toBeNull();
  });

  it("changes nothing", async () => {
    const { error: insertError } = await visitor
      .from("cabins")
      .insert([{ name: "Nope", maxCapacity: 2, regularPrice: 1, discount: 0 }]);
    expect(insertError).not.toBeNull();

    const { data: updated } = await visitor
      .from("settings")
      .update({ breakfastPrice: 0 })
      .gt("id", 0)
      .select();
    expect(updated ?? []).toEqual([]);

    const { error: rpcError } = await visitor.rpc("ensure_guest_profile");
    expect(rpcError).not.toBeNull();
  });

  it("cannot upload files", async () => {
    const { error } = await visitor.storage
      .from("cabin-images")
      .upload(`access-visitor-${run}.txt`, new Blob(["x"]));
    expect(error).not.toBeNull();
  });
});

describe("a signed-in guest", () => {
  it("gets one profile, however often they sign in", async () => {
    const { data: again } = await guestA.client.rpc("ensure_guest_profile");
    expect(again.id).toBe(guestAProfile.id);
    expect(again.authUserId).toBe(guestA.id);
  });

  it("takes over the guest the hotel already knew by their email", async () => {
    const { data } = await guestB.client.rpc("ensure_guest_profile");
    expect(data.id).toBe(knownGuestId);
    expect(data.authUserId).toBe(guestB.id);
  });

  it("sees only their own profile and bookings", async () => {
    const { data: guests } = await guestA.client.from("guests").select("id");
    expect(guests.map((guest) => guest.id)).toEqual([guestAProfile.id]);

    const { data: mine } = await guestA.client.from("bookings").select("id");
    expect(mine.map((booking) => booking.id)).toEqual(created.bookings);

    const { data: theirs } = await guestB.client.from("bookings").select("id");
    expect(theirs).toEqual([]);

    const { data: searched } = await guestB.client
      .from("bookings_search")
      .select("id");
    expect(searched).toEqual([]);
  });

  it("is not staff", async () => {
    const { data: isStaff } = await guestA.client.rpc("is_staff");
    expect(isStaff).toBe(false);

    const { data: team } = await guestA.client.from("staff_members").select("*");
    expect(team).toEqual([]);
  });

  it("cannot write bookings, guests, cabins or settings directly", async () => {
    const { error: bookingError } = await guestA.client.from("bookings").insert([
      {
        cabinId: openCabin.id,
        guestId: guestAProfile.id,
        startDate: farFuture(5, 1),
        endDate: farFuture(5, 4),
        totalPrice: 1,
      },
    ]);
    expect(bookingError).not.toBeNull();

    const { data: renamed } = await guestA.client
      .from("guests")
      .update({ fullName: "Someone else" })
      .eq("id", guestAProfile.id)
      .select();
    expect(renamed ?? []).toEqual([]);

    const { data: cabins } = await guestA.client
      .from("cabins")
      .update({ regularPrice: 1 })
      .eq("id", openCabin.id)
      .select();
    expect(cabins ?? []).toEqual([]);

    const { data: settings } = await guestA.client
      .from("settings")
      .update({ breakfastPrice: 0 })
      .gt("id", 0)
      .select();
    expect(settings ?? []).toEqual([]);
  });

  it("updates their details only through update_guest_profile", async () => {
    const { error: badId } = await guestA.client.rpc("update_guest_profile", {
      p_nationality: "Portugal",
      p_country_flag: "https://flagcdn.com/pt.svg",
      p_national_id: "x",
    });
    expect(badId).not.toBeNull();

    const { error: badFlag } = await guestA.client.rpc("update_guest_profile", {
      p_nationality: "Portugal",
      p_country_flag: "https://evil.example/flag.svg",
      p_national_id: "AB123456",
    });
    expect(badFlag).not.toBeNull();

    const { data, error } = await guestA.client.rpc("update_guest_profile", {
      p_nationality: "Portugal",
      p_country_flag: "https://flagcdn.com/pt.svg",
      p_national_id: "AB123456",
    });
    expect(error).toBeNull();
    expect(data.id).toBe(guestAProfile.id);
    expect(data.nationalID).toBe("AB123456");
  });

  it("cannot upload files", async () => {
    const { error } = await guestA.client.storage
      .from("cabin-images")
      .upload(`access-guest-${run}.txt`, new Blob(["x"]));
    expect(error).not.toBeNull();
  });
});

describe("Ardevane Operations sign in", () => {
  // The dashboard's real login(), against the real project
  it("turns a guest account away", async () => {
    const { login } = await import("../../src/services/apiAuth.js");

    await expect(
      login({ email: guestA.email, password: guestA.password })
    ).rejects.toThrow("doesn't have access");
  });

  it("lets a member of staff in, with their role", async () => {
    const { login, logout } = await import("../../src/services/apiAuth.js");

    const user = await login({ email: boss.email, password: boss.password });
    expect(user.staff.role).toBe("admin");

    await logout();
  });
});

describe("staff", () => {
  it("front desk sees every guest and every cabin, archived included", async () => {
    const { count: allGuests } = await admin
      .from("guests")
      .select("id", { count: "exact", head: true });
    const { count: seen } = await frontDesk.client
      .from("guests")
      .select("id", { count: "exact", head: true });
    expect(seen).toBe(allGuests);

    const { data: archived } = await frontDesk.client
      .from("cabins")
      .select("id")
      .eq("id", archivedCabin.id);
    expect(archived).toHaveLength(1);
  });

  it("front desk can't change the house rules or the team", async () => {
    const { data: settings } = await frontDesk.client
      .from("settings")
      .update({ breakfastPrice: 0 })
      .gt("id", 0)
      .select();
    expect(settings ?? []).toEqual([]);

    const { error } = await frontDesk.client
      .from("staff_members")
      .insert([{ userId: guestA.id, role: "admin" }]);
    expect(error).not.toBeNull();
  });

  it("an admin changes the house rules and sees the team", async () => {
    const { data: current } = await admin.from("settings").select("*").single();

    const { data: saved } = await boss.client
      .from("settings")
      .update({ breakfastPrice: current.breakfastPrice })
      .eq("id", current.id)
      .select();
    expect(saved).toHaveLength(1);

    const { data: team } = await boss.client.from("staff_members").select("userId");
    expect(team.length).toBeGreaterThanOrEqual(2);
  });

  it("staff upload and remove cabin photos", async () => {
    const path = `access-staff-${run}.txt`;

    const { error: uploadError } = await boss.client.storage
      .from("cabin-images")
      .upload(path, new Blob(["x"]));
    expect(uploadError).toBeNull();
    created.files.push(path);

    const { error: removeError } = await boss.client.storage
      .from("cabin-images")
      .remove([path]);
    expect(removeError).toBeNull();
  });

  it("someone taken off the team loses access at once", async () => {
    await admin
      .from("staff_members")
      .update({ isActive: false })
      .eq("userId", frontDesk.id);

    const { data: guests } = await frontDesk.client.from("guests").select("id");
    expect(guests).toEqual([]);
  });
});
