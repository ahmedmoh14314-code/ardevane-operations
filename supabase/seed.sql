-- ===========================================================================
--  Seed for a local Supabase (supabase db reset)
--
--  For now only the house rules, so both apps start. The full demo data
--  (cabins, guests, stays, orders and requests) comes once the schema for
--  bookings, charges and requests is final.
-- ===========================================================================

insert into public.settings ("minBookingLength", "maxBookingLength", "maxGuestsPerBooking", "breakfastPrice")
values (3, 90, 8, 15);
