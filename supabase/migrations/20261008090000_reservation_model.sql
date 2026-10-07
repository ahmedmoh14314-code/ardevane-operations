-- ===========================================================================
--  Reservation model
--
--  The bookings table is reshaped so the database itself keeps it correct:
--
--    dates           a stay is two calendar dates, so the columns become
--                    `date` (no more time zones shifting a stay by a day)
--    nights          worked out from the dates, never typed in
--    status          reserved → checked_in → checked_out, or cancelled /
--                    no_show; anything else is refused
--    reference       a short code like ARD-7K3Q9P for guests and the desk
--    no overlaps     two live stays can never share a night in one cabin
--    money           exact numeric amounts instead of floats
--
--  Cancelling a booking now keeps it, with when and who.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 0. A schema for helpers the API never exposes
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- 1. The search view reads every booking column, so it steps aside while the
--    columns change, and comes back at the end.
-- ---------------------------------------------------------------------------
drop view if exists public.bookings_search;


-- ---------------------------------------------------------------------------
-- 2. Rows the new rules could never accept
-- ---------------------------------------------------------------------------
delete from public.bookings
where "startDate" is null
   or "endDate" is null
   or "guestId" is null
   or "endDate" <= "startDate";


-- ---------------------------------------------------------------------------
-- 3. Status names
-- ---------------------------------------------------------------------------
update public.bookings
set status = case status
  when 'unconfirmed' then 'reserved'
  when 'checked-in' then 'checked_in'
  when 'checked-out' then 'checked_out'
  when 'no-show' then 'no_show'
  when 'cancelled' then 'cancelled'
  else 'reserved'
end;


-- ---------------------------------------------------------------------------
-- 4. Dates without times. A stay saved as "the evening before, in UTC" is
--    rounded to the nearest day, so every booking keeps the day it meant.
-- ---------------------------------------------------------------------------
alter table public.bookings
  alter column "startDate" type date using ("startDate" + interval '12 hours')::date,
  alter column "endDate" type date using ("endDate" + interval '12 hours')::date;

alter table public.bookings drop column "numNights";
alter table public.bookings
  add column "numNights" integer generated always as ("endDate" - "startDate") stored;


-- ---------------------------------------------------------------------------
-- 5. Exact money
-- ---------------------------------------------------------------------------
alter table public.bookings
  alter column "cabinPrice" type numeric(10, 2),
  alter column "extrasPrice" type numeric(10, 2),
  alter column "totalPrice" type numeric(10, 2);


-- ---------------------------------------------------------------------------
-- 6. The booking id alone is the key (it used to be id + cabin), and the
--    foreign keys lose the course project's typos
-- ---------------------------------------------------------------------------
alter table public.bookings drop constraint bookings_pkey;
alter table public.bookings add constraint bookings_pkey primary key (id);

alter table public.bookings rename constraint "bookings_cabinID_fkey" to bookings_cabin_id_fkey;
alter table public.bookings rename constraint "bookings_gusetID_fkey" to bookings_guest_id_fkey;


-- ---------------------------------------------------------------------------
-- 7. Booking reference: ARD- and six characters that can't be misread
--    (no 0/O, 1/I/L)
-- ---------------------------------------------------------------------------
create or replace function public.new_booking_reference()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'ARD-' || string_agg(
    substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1),
    ''
  )
  from generate_series(1, 6);
$$;

alter table public.bookings
  add column reference text not null default public.new_booking_reference();

alter table public.bookings
  add constraint bookings_reference_key unique (reference);


-- ---------------------------------------------------------------------------
-- 8. Where a booking came from, who made it, and who cancelled it
-- ---------------------------------------------------------------------------
alter table public.bookings
  add column source text not null default 'website'
    check (source in ('website', 'walk_in', 'phone')),
  add column "createdBy" uuid references auth.users (id) on delete set null,
  add column "cancelledAt" timestamptz,
  add column "cancelledBy" uuid references auth.users (id) on delete set null;

update public.bookings
set "cancelledAt" = created_at
where status = 'cancelled';


-- ---------------------------------------------------------------------------
-- 9. Nothing essential may be missing, and nothing may be nonsense
-- ---------------------------------------------------------------------------
update public.bookings set "extrasPrice" = 0 where "extrasPrice" is null;
update public.bookings set "hasBreakfast" = false where "hasBreakfast" is null;
update public.bookings set "isPaid" = false where "isPaid" is null;
update public.bookings set "totalPrice" = coalesce("cabinPrice", 0) + "extrasPrice" where "totalPrice" is null;
update public.bookings set "cabinPrice" = "totalPrice" - "extrasPrice" where "cabinPrice" is null;
update public.bookings set "numGuests" = 1 where "numGuests" is null or "numGuests" < 1;

alter table public.bookings
  alter column "startDate" set not null,
  alter column "endDate" set not null,
  alter column "guestId" set not null,
  alter column "numGuests" set not null,
  alter column "cabinPrice" set not null,
  alter column "extrasPrice" set not null,
  alter column "extrasPrice" set default 0,
  alter column "totalPrice" set not null,
  alter column "hasBreakfast" set not null,
  alter column "hasBreakfast" set default false,
  alter column "isPaid" set not null,
  alter column "isPaid" set default false,
  alter column status set not null,
  alter column status set default 'reserved';

alter table public.bookings
  add constraint bookings_status_check
    check (status in ('reserved', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  add constraint bookings_dates_check check ("endDate" > "startDate"),
  add constraint bookings_guests_check check ("numGuests" >= 1),
  add constraint bookings_prices_check
    check ("cabinPrice" >= 0 and "extrasPrice" >= 0 and "totalPrice" >= 0),
  add constraint bookings_cancelled_check
    check ((status = 'cancelled') = ("cancelledAt" is not null));


-- ---------------------------------------------------------------------------
-- 10. No two live stays in one cabin on the same night.
--     Older sample data has a few clashes: the later booking of each clash
--     is cancelled first, so the rule can hold.
-- ---------------------------------------------------------------------------
do $$
declare
  b record;
begin
  for b in
    select * from public.bookings
    where status not in ('cancelled', 'no_show')
    order by id
  loop
    if exists (
      select 1
      from public.bookings kept
      where kept."cabinId" = b."cabinId"
        and kept.id < b.id
        and kept.status not in ('cancelled', 'no_show')
        and daterange(kept."startDate", kept."endDate", '[)')
            && daterange(b."startDate", b."endDate", '[)')
    ) then
      update public.bookings
      set status = 'cancelled', "cancelledAt" = now()
      where id = b.id;
    end if;
  end loop;
end;
$$;

create extension if not exists btree_gist with schema extensions;

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    "cabinId" with =,
    daterange("startDate", "endDate", '[)') with &&
  )
  where (status not in ('cancelled', 'no_show'));

create index if not exists bookings_guest_idx on public.bookings ("guestId");
create index if not exists bookings_start_idx on public.bookings ("startDate");


-- ---------------------------------------------------------------------------
-- 11. The hotel's own "today", in its own time zone
-- ---------------------------------------------------------------------------
alter table public.settings
  add column "timeZone" text not null default 'Europe/Istanbul';

create or replace function public.property_today()
returns date
language sql
stable
security definer
set search_path = ''
as $$
  select (now() at time zone coalesce(
    (select s."timeZone" from public.settings s order by s.id limit 1),
    'UTC'
  ))::date;
$$;


-- ---------------------------------------------------------------------------
-- 12. Only these status changes exist:
--       reserved    → checked_in (from the arrival day), cancelled,
--                     no_show (from the arrival day)
--       checked_in  → checked_out
-- ---------------------------------------------------------------------------
create or replace function private.check_booking_status_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if not (
    (old.status = 'reserved' and new.status in ('checked_in', 'cancelled', 'no_show'))
    or (old.status = 'checked_in' and new.status = 'checked_out')
  ) then
    raise exception 'A booking that is % can''t become %',
      replace(old.status, '_', ' '), replace(new.status, '_', ' ')
      using errcode = '22023';
  end if;

  if new.status in ('checked_in', 'no_show') and old."startDate" > public.property_today() then
    raise exception 'This stay only starts on %', to_char(old."startDate", 'Mon DD')
      using errcode = '22023';
  end if;

  if new.status = 'cancelled' and new."cancelledAt" is null then
    new."cancelledAt" := now();
  end if;

  return new;
end;
$$;

create trigger bookings_status_change
  before update of status on public.bookings
  for each row
  execute function private.check_booking_status_change();


-- ---------------------------------------------------------------------------
-- 13. The search view, back with the new columns. The reference is
--     searchable too.
-- ---------------------------------------------------------------------------
create view public.bookings_search
with (security_invoker = true) as
select
  b.*,
  g."fullName" as guest_name,
  g.email      as guest_email,
  c.name       as cabin_name
from public.bookings b
left join public.guests g on g.id = b."guestId"
left join public.cabins c on c.id = b."cabinId";

revoke all on public.bookings_search from anon;
grant select on public.bookings_search to authenticated;
