# Ardevane Operations

The internal dashboard for a mountain cabin resort. Front-desk staff use it to run the day: who arrives, who leaves, which cabins are free, what each stay still owes.

## What it does

- **Bookings** — take walk-in and phone bookings with a live price; search by guest, email, cabin or booking reference; filter by status with live counts; check guests in and out from the row; cancel, or record a no-show; see what each stay still owes.
- **Stay folio** — every booking has a folio: the nights, extra charges (breakfast, laundry, extra cleaning or anything written in) and the cash taken, with what is still to pay worked out from them. Check-in and checkout never depend on payment.
- **Today** — arrivals and departures for the current day on the dashboard, with sales and stay-length charts for the last 7, 30 or 90 days.
- **Cabins** — photo cards with the nightly price after discount; a gallery per cabin; archive a cabin instead of deleting it, so its booking history stays.
- **Guests** — every guest with their stays, nights and total spend.
- **Occupancy calendar** — each cabin on a timeline, so free nights are easy to spot.
- **Team and settings** — staff accounts, and the rules every booking is priced against.
- Light and dark themes, and a layout that works from a phone to a wide screen.

## Built with

React · React Router · TanStack Query · styled-components · Recharts · Supabase (Postgres, Auth, Storage) · Vite · Vitest

## Under the hood

- The booking search runs inside Postgres through a view, so one box can match a guest, an email, a cabin or a booking number, and only one page of results is ever downloaded.
- Signing in is not enough to open the dashboard. Guests have accounts too (on the guest website), so staff are the accounts listed in `staff_members`, each with a role: admin, front desk, housekeeping or maintenance.
- Every table is locked with row-level security. Visitors see only open cabins and the house rules, a guest sees only their own profile and bookings, and staff see everything. Uploading photos is staff-only too.
- Stays are calendar days, and "today" is worked out in the hotel's own time zone, so a stay never shifts by a day or disappears from the list in the hours after midnight.
- Bookings are made only through database functions, shared by this dashboard (walk-in and phone bookings) and the guest website, so there is one set of rules: an open cabin, the house rules for stay length and guests, free nights, and a price the database works out itself.
- Nothing about money is stored as a total or a paid flag. A view adds up each folio (accommodation + charges − payments) every time it is read, so the numbers can't drift. Only staff can add a charge or record a payment, amounts must be above zero, and the only payment method is cash.
- A no-overlap constraint makes it impossible for two stays to share a night in a cabin, even when two people confirm at the same moment.
- A booking moves through reserved → checked in → checked out, or ends as cancelled or a no-show; the database refuses any other step. Cancelling keeps the booking on record, and every booking has a short reference like ARD-7K3Q9P.
- Each page is loaded only when it is opened.
- Folio, date and guest-stat logic is covered by unit tests. The access, booking and folio rules are covered by database tests that sign in as a visitor, guests, a front desk employee and an admin, including two guests booking the same nights at the same moment.

## The backend

This repository owns the database for both apps (this dashboard and the [guest website](https://github.com/ahmedmoh14314-code/ardevane-website)). Everything lives in `supabase/`:

- `migrations/` builds the schema step by step, access rules included. The first file is the starting point; each one after it says what it changes and why.
- `seed.sql` fills a local database.
- `tests/` checks the access rules against a real project (`npm run test:db`).

To set up your own project:

1. Create a Supabase project and copy `.env.example` to `.env.local` and `.env.test.local` (the file says which value goes where).
2. Apply the migrations: `npx supabase db push --db-url "$SUPABASE_DB_URL"`.
3. Create your own account in Supabase (Authentication > Users > Add user). There is no team yet to add you from the dashboard, so make it the first admin in the SQL editor:
   `insert into staff_members ("userId", role) select id, 'admin' from auth.users where email = 'you@example.com';`
4. From then on, admins add the rest of the team from the Team page.
5. Point `src/services/supabase.js` at your project and run `npm install`, then `npm run dev`.
