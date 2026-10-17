# Ardevane Operations

The staff-facing side of Ardevane, a cabin hotel system made of two applications on one Supabase database. Front-desk staff use it to run the day: approve booking requests, check guests in and out, keep track of which cabins are ready, handle what guests ask for, and record what each stay owes. The guest side is the [Ardevane Guest Website](https://github.com/ahmedmoh14314-code/ardevane-website).

This repository also owns the database: the Supabase migrations, seed and database tests both applications depend on.

React 18 · Vite · React Router 6 · TanStack Query 4 · styled-components · Supabase

## Live demo

The dashboard is deployed for staff only; signing in needs a staff account, and there is no shared demo account yet. The screens are described below and the guest side can be tried at [ardevane.netlify.app](https://ardevane.netlify.app).

## What this project demonstrates

- **Server state with TanStack Query.** Every read is a `useQuery` in a small hook next to its feature (`useBookings`, `useCabins`, `useFolio`, …), with a shared client, a one-minute `staleTime` and no refetch on window focus.
- **The URL is the state.** In `src/features/bookings/useBookings.js` the search text, status filter, sort and page all come from the search params and form the query key, so any view of the bookings table can be linked to. The neighbouring pages are prefetched so paging feels instant.
- **Mutations that feel immediate.** `useCabinCondition` and `useToggleCabinActive` update the cache in `onMutate`, roll back in `onError` and invalidate in `onSettled`. Login writes the user into the cache with `setQueryData` instead of refetching.
- **Routing.** React Router 6 with one layout route behind `ProtectedRoute`, every page loaded with `lazy()` behind a single `Suspense`, and a redirect for a renamed route.
- **Protection by role, not by session.** `useUser` returns `isStaff` from a `staff_members` row, and `ProtectedRoute` sends anyone else to the login page. A guest with an account cannot open the dashboard.
- **Forms.** `react-hook-form` for cabins, walk-in bookings, staff sign-up and the password form. The walk-in booking form asks the database for a live price quote through a query that is only `enabled` once the form is complete (`useBookingQuote`).
- **Compound components.** `Modal`, `Menus` and `Table` in `src/ui/` share state through Context and render through `createPortal`, so a page composes them without prop drilling.
- **Theming.** styled-components with CSS variables for the light and dark themes; `DarkModeContext` reads `prefers-color-scheme` first and remembers the choice in `localStorage`. Animations respect `prefers-reduced-motion`.
- **Small hooks with one job.** `useDebounce` for the search box, `useOutsideClick` for menus and modals, `useLocalStorageState`, `useMediaQuery`, `useMoveBack`.
- **Keyboard and screen readers.** A global search opened with Ctrl K or ⌘ K (the label follows the visitor's platform), `aria-label` on icon buttons, `aria-pressed` on toggles, `aria-expanded` and `aria-haspopup` on menus, `aria-controls` on the navigation, `aria-modal` on dialogs.
- **Failure handling.** A root `ErrorBoundary` with a reset that returns to the dashboard, toasts for every mutation error, skeletons while data loads, empty states for empty lists.
- **Charts.** Sales and stay-length charts with Recharts, over the last 7, 30 or 90 days.
- **Tests.** 41 Vitest unit tests on the helpers and services, and 68 database tests that sign in as a visitor, two guests, a front-desk employee and an admin and check the access rules, booking rules, folio maths, cabin condition and requests against a real Supabase project.

## Key decisions

- **Booking rules are enforced in the database.** `create_booking` (guests) and `create_staff_booking` (staff) share one quote and one set of checks: an open cabin, the stay-length and guest limits from Settings, free nights, and a price the database computes. An exclusion constraint on the booking date range rejects overlapping stays in the same cabin, even from two simultaneous requests. A trigger refuses any status change outside the lifecycle.
- **Staff are a table, not "anyone signed in".** Guests and staff share Supabase Auth. Being signed in gives nothing; `staff_members` rows with a role (admin, front desk, housekeeping, maintenance) do, and the policies call `is_staff()` and `staff_role()`. Only admins manage the team and settings.
- **Occupancy is derived, condition is stored.** "Occupied" comes from the checked-in booking. `cabins.condition` (`ready`, `dirty`, `cleaning`, `out_of_service`) is separate, so a cabin can be occupied and dirty at the same time. Checkout sets the cabin to dirty from a trigger, whichever screen it is done from.
- **The folio is a view.** No stored totals or paid flags. `booking_folios` adds accommodation and charges and subtracts payments each time it is read.
- **One request model.** Food orders, housekeeping, cabin, maintenance and support requests are one table with one lifecycle (`new → in_progress → completed`) and per-type labels in the UI. Completing a food order inserts one charge linked to the request, so it cannot be charged twice.
- **Booking search runs in Postgres.** A `bookings_search` view puts the guest name, email and cabin name on the booking row, so one search box matches any of them and only one page of results is downloaded.
- **Calendar dates, in the property's time zone.** Stays are stored as dates and "today" is computed in the hotel's time zone, so nothing shifts by a day around midnight.

## Where to look

| File | What it shows |
| --- | --- |
| `src/features/bookings/useBookings.js` | URL-driven query keys and page prefetching |
| `src/features/cabins/useCabinCondition.js` | Optimistic update with rollback |
| `src/services/apiBookingsSearch.js` | Search, filter, sort and pagination built as one Supabase query |
| `src/features/bookings/useBookingQuote.js` | A query enabled only when the form is complete |
| `src/ui/ProtectedRoute.jsx` + `useUser.js` | Role-based protection |
| `src/ui/Modal.jsx`, `src/ui/Menus.jsx` | Compound components with Context and a portal |
| `src/ui/GlobalSearch.jsx` | Keyboard shortcut handling |
| `src/App.jsx` | Lazy routes, query client defaults |
| `supabase/migrations/` | The schema, policies, functions and triggers, one change per file |
| `supabase/tests/bookings.test.js` | Two guests booking the same nights at the same moment |

## What staff can do

- **Dashboard**: today's arrivals and departures with check-in and checkout from the list, guests in house, cabins that need attention, pending booking requests, the oldest open guest requests, and sales and stay-length charts.
- **Bookings**: a lifecycle of `pending → reserved → checked_in → checked_out`, or `cancelled` / `no_show`. Search, filter by status with counts, sort, paginate. Approve or decline website requests. Walk-in and phone bookings with a live price.
- **Check-in and checkout**, with a warning when the cabin is not ready or a balance is unpaid. Neither one blocks.
- **Occupancy calendar**: each cabin on a timeline.
- **Cabins**: photo galleries, a housekeeping track (dirty → cleaning → ready), out-of-service, who is staying in each one, and archive instead of delete so booking history stays.
- **Guests**: every guest with their stays, nights and total spend.
- **Stay folio**: accommodation, extra charges, cash payments and the balance.
- **Request queue**: food orders, housekeeping, cabin and maintenance requests and messages from guests, in one list with one next step per request.
- **Team, Settings, Account**: staff accounts and roles, stay rules, the signed-in user's name, avatar and password.
- Global search, light and dark themes, and a layout that works from a phone to a wide screen.

## How it connects to the guest website

Both applications use the same database, so there is no API between them. A reservation request made on the website appears here as `pending`; approving it makes it `reserved` and the guest sees the change. Checking a guest in switches the guest's account on the website to My Stay. A food order sent from the website lands in the request queue here, and marking it delivered posts its charge to the folio the guest can read.

```
   React / Vite Operations          Next.js Guest Website
   (this repository)                (ardevane-website)
             \                            /
              \                          /
                      Supabase
            Postgres · Auth · Storage
```

## Tech stack

- React 18, Vite 4, React Router 6
- TanStack Query 4
- Supabase (`@supabase/supabase-js`): PostgreSQL, Auth, Storage
- styled-components, Recharts
- react-hook-form, react-hot-toast, react-error-boundary, date-fns
- Vitest

## Project structure

```
src/
├── features/      one folder per area: bookings, cabins, check-in-out, dashboard,
│                  folio, guests, requests, calendar, settings, authentication
│                  (components + their useQuery / useMutation hooks)
├── services/      every Supabase call (apiBookings, apiCabins, apiFolio, …)
├── ui/            shared components: Table, Modal, Menus, Form, Pagination, …
├── hooks/         useDebounce, useOutsideClick, useLocalStorageState, …
├── pages/         one file per route, each lazy-loaded
├── styles/        global styles, breakpoints, animations
└── utils/         dates, folio and operations helpers, with their tests
supabase/
├── migrations/    the schema, policies, functions, triggers and views
├── seed.sql       the stay rules a fresh database needs
└── tests/         database tests (npm run test:db)
```

## Running locally

```bash
npm install
cp .env.example .env.local        # SUPABASE_DB_URL, to apply migrations
npx supabase db push --db-url "$SUPABASE_DB_URL"
npm run dev                       # http://localhost:5173
npm test                          # unit tests
npm run test:db                   # database tests, needs .env.test.local
```

Then create the first staff account: in Supabase, **Authentication → Users → Add user**, and in the SQL editor:

```sql
insert into staff_members ("userId", role)
select id, 'admin' from auth.users where email = 'you@example.com';
```

From then on, admins add the rest of the team from the Team page. The Supabase URL and publishable key the app uses are in `src/services/supabase.js`.
