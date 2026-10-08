# Ardevane Operations

The internal, staff-facing application of Ardevane, a cabin hospitality system made of two applications on one Supabase backend. Front-desk staff use it to run the day: approve booking requests, check guests in and out, keep track of which cabins are ready, handle what guests ask for, and record what each stay owes. The guest side is the [Ardevane Guest Website](https://github.com/ahmedmoh14314-code/ardevane-website).

This repository also owns the database: the Supabase migrations, seed and database tests both applications depend on.

## Overview

A booking enters the system either from the guest website, as a request the hotel approves, or from the front desk as a walk-in or phone booking. From then on staff manage it here: check-in on the arrival day, requests and charges during the stay, cash payments at the desk, checkout at the end. Cabins have a housekeeping condition that checkout changes automatically, and the dashboard opens on what needs attention today.

## Key Features

- **Dashboard**: today's arrivals and departures with check-in and checkout from the list, guests in house, cabins that are dirty, being cleaned or out of service, pending booking requests, the oldest open guest requests, and sales and stay-length charts for the last 7, 30 or 90 days.
- **Bookings**: a lifecycle of `pending → reserved → checked_in → checked_out`, or `cancelled` / `no_show`. Search by guest, email, cabin or reference; filter by status with counts; paginate.
- **Booking requests** from the website, approved or declined from the dashboard.
- **Walk-in and phone bookings** created by staff with a live price quote.
- **Check-in and checkout**, with a warning when the cabin is not ready or a balance is unpaid. Neither one blocks.
- **Occupancy calendar**: each cabin on a timeline.
- **Cabins**: photo cards and galleries, a housekeeping track (dirty → cleaning → ready), out-of-service, who is staying in each one, and archive instead of delete so booking history stays.
- **Guests**: every guest with their stays, nights and total spend.
- **Stay folio**: accommodation, extra charges (from a services list or written in), cash payments, and the balance derived from them.
- **Request queue**: food orders, housekeeping, cabin and maintenance requests and messages from guests, in one list with one next step per request (`new → in_progress → completed`). A delivered food order adds its charge to the folio.
- **Team**: staff accounts with a role: admin, front desk, housekeeping or maintenance. Only admins add staff.
- **Settings**: minimum and maximum stay, maximum guests per booking.
- **Account**: name, avatar and password.
- Global search (Ctrl K / ⌘ K), light and dark themes, and a layout that works from a phone to a wide screen.

## How It Connects to the Guest Website

Both applications use the same database, so there is no API between them:

- A reservation request made on the website appears here as `pending`; approving it makes it `reserved` and the guest sees the change.
- Checking a guest in switches the guest's account on the website to My Stay.
- A food order or housekeeping request sent from the website lands in the request queue here.
- Marking a food order delivered posts its charge to the folio, which the guest can read on the website.
- Archiving a cabin or changing the stay rules in Settings changes what the website offers.

Guest website: https://github.com/ahmedmoh14314-code/ardevane-website

## Architecture

```
   React / Vite Operations          Next.js Guest Website
   (this repository)                (ardevane-website)
             \                            /
              \                          /
                      Supabase
            Postgres · Auth · Storage
```

The database is the shared source of truth. This repository holds its migrations, seed data and tests under `supabase/`. The dashboard talks to Supabase directly from the browser with the staff member's session; every table is protected by row-level security, and writes that carry business rules go through database functions.

## Engineering Decisions

- **Booking rules are enforced in the database.** `create_booking` (guests) and `create_staff_booking` (staff) share one quote and one set of checks: an open cabin, the stay-length and guest limits from Settings, free nights, and a price the database computes. An exclusion constraint on the booking date range rejects overlapping stays in the same cabin, even from two simultaneous requests. A trigger refuses any status change outside the lifecycle.
- **Staff are a table, not "anyone signed in".** Guests and staff share Supabase Auth. Being signed in gives nothing; `staff_members` rows with a role do, and the policies call `is_staff()` and `staff_role()`.
- **Row-level security everywhere.** Anonymous visitors read open cabins and the stay rules. A guest reads and changes only their own profile, bookings, charges and requests. Staff read everything; only admins manage the team and settings. Storage uploads are staff-only.
- **Occupancy is derived, condition is stored.** "Occupied" comes from the checked-in booking. `cabins.condition` (`ready`, `dirty`, `cleaning`, `out_of_service`) is a separate thing, so a cabin can be occupied and dirty at the same time. Checkout sets the cabin to dirty from a trigger, whichever screen it is done from.
- **The folio is a view.** No stored totals or paid flags. `booking_folios` adds accommodation and charges and subtracts payments each time it is read. Only staff can add charges or record payments, amounts must be positive, and cash is the only method.
- **One request model.** Food orders, housekeeping, cabin, maintenance and support requests are one table with one lifecycle and per-type labels in the UI. Guests create them through a function that finds their current or next confirmed stay. Completing a food order inserts one charge linked to the request, so it cannot be charged twice.
- **Calendar dates, in the property's time zone.** Stays are stored as dates, and "today" is computed in the hotel's time zone, so nothing shifts by a day around midnight.
- **Booking search runs in Postgres** through a view, so one box matches guest, email, cabin or reference and only one page of results is downloaded.

## Tech Stack

- React 18 and Vite 4
- React Router 6
- TanStack Query 4
- Supabase (`@supabase/supabase-js`): PostgreSQL, Auth, Storage
- styled-components
- Recharts
- react-hook-form, react-hot-toast, date-fns
- Vitest: 41 unit tests, plus database tests that run against a real Supabase project

## Backend

Everything the database needs is under `supabase/`:

- `migrations/` builds the schema step by step, including the policies, functions, triggers and views. The first file is the baseline; each file after it says what it changes and why.
- `seed.sql` gives a fresh database the stay rules it needs to start. Cabins, menu and demo bookings are not seeded yet.
- `tests/` signs in as a visitor, two guests, a front-desk employee and an admin and checks the access rules, booking rules, folio maths, cabin condition and requests (`npm run test:db`). The booking tests include two guests booking the same nights at the same moment.

## Local Development

```bash
npm install
cp .env.example .env.local        # SUPABASE_DB_URL, to apply migrations
npx supabase db push --db-url "$SUPABASE_DB_URL"
npm run dev                       # http://localhost:5173
npm test                          # unit tests
npm run test:db                   # database tests, needs .env.test.local
```

Then create your first staff account:

1. In Supabase, **Authentication → Users → Add user**.
2. In the SQL editor, make that user an admin:
   ```sql
   insert into staff_members ("userId", role)
   select id, 'admin' from auth.users where email = 'you@example.com';
   ```
3. From then on, admins add the rest of the team from the Team page.

The Supabase URL and publishable key the app uses are in `src/services/supabase.js`.

## Related Repository

[Ardevane Guest Website](https://github.com/ahmedmoh14314-code/ardevane-website), the Next.js site where guests browse cabins, request reservations and use My Stay.
