-- ===========================================================================
--  Booking functions
--
--  Every booking is made through the functions below, from the guest website
--  and from Ardevane Operations alike. Nobody can insert a booking row
--  directly any more, so there is one set of rules for everyone:
--
--    quote_booking          the price and every check, before anyone commits
--    create_booking         a signed-in guest books for themselves
--    create_staff_booking   the front desk books a walk-in or phone guest
--    update_booking         a guest changes the number of guests or notes
--    cancel_booking         a guest (until the day before) or staff
--    get_booked_dates       the taken nights of a cabin, dates only
--
--  The price is always worked out here, from the cabin, never taken from
--  the browser.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- The rules, in one place. Raises a readable message (code 22023) when a
-- booking can't be made, and returns the nights and the price when it can.
-- ---------------------------------------------------------------------------
create or replace function private.booking_quote(
  p_cabin_id bigint,
  p_start_date date,
  p_end_date date,
  p_num_guests integer,
  p_ignore_booking_id bigint default null
)
returns table (nights integer, nightly_price numeric, cabin_price numeric)
language plpgsql
stable
set search_path = ''
as $$
declare
  v_cabin    public.cabins%rowtype;
  v_settings public.settings%rowtype;
  v_nights   integer;
  v_nightly  numeric;
  v_max      integer;
begin
  select * into v_cabin
  from public.cabins
  where id = p_cabin_id and is_active;

  if not found then
    raise exception 'This cabin is not open for booking' using errcode = '22023';
  end if;

  select * into v_settings from public.settings order by id limit 1;

  if p_start_date is null or p_end_date is null then
    raise exception 'Please choose your arrival and departure dates' using errcode = '22023';
  end if;

  if p_start_date < public.property_today() then
    raise exception 'The arrival date has already passed' using errcode = '22023';
  end if;

  v_nights := p_end_date - p_start_date;

  if v_nights < 1 then
    raise exception 'Departure must be after arrival' using errcode = '22023';
  end if;

  if v_nights < v_settings."minBookingLength" then
    raise exception 'Stays are at least % nights', v_settings."minBookingLength"
      using errcode = '22023';
  end if;

  if v_nights > v_settings."maxBookingLength" then
    raise exception 'Stays are at most % nights', v_settings."maxBookingLength"
      using errcode = '22023';
  end if;

  v_max := least(v_cabin."maxCapacity", v_settings."maxGuestsPerBooking");

  if p_num_guests is null or p_num_guests < 1 or p_num_guests > v_max then
    raise exception 'This cabin sleeps up to % guests', v_max using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.bookings b
    where b."cabinId" = p_cabin_id
      and b.status not in ('cancelled', 'no_show')
      and (p_ignore_booking_id is null or b.id <> p_ignore_booking_id)
      and daterange(b."startDate", b."endDate", '[)')
          && daterange(p_start_date, p_end_date, '[)')
  ) then
    raise exception 'Some of these nights are already booked. Please choose other dates.'
      using errcode = '22023';
  end if;

  v_nightly := v_cabin."regularPrice" - coalesce(v_cabin.discount, 0);

  return query select v_nights, v_nightly, v_nights * v_nightly;
end;
$$;


-- ---------------------------------------------------------------------------
-- quote_booking: anyone, signed in or not, can check dates and see the price
-- ---------------------------------------------------------------------------
create or replace function public.quote_booking(
  p_cabin_id bigint,
  p_start_date date,
  p_end_date date,
  p_num_guests integer
)
returns table (nights integer, nightly_price numeric, total_price numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select q.nights, q.nightly_price, q.cabin_price
  from private.booking_quote(p_cabin_id, p_start_date, p_end_date, p_num_guests) q;
$$;


-- ---------------------------------------------------------------------------
-- get_booked_dates: the taken nights of one cabin, from today on. Only
-- dates, never who booked them.
-- ---------------------------------------------------------------------------
create or replace function public.get_booked_dates(p_cabin_id bigint)
returns table (start_date date, end_date date)
language sql
stable
security definer
set search_path = ''
as $$
  select b."startDate", b."endDate"
  from public.bookings b
  where b."cabinId" = p_cabin_id
    and b.status not in ('cancelled', 'no_show')
    and b."endDate" > public.property_today()
  order by b."startDate";
$$;


-- ---------------------------------------------------------------------------
-- create_booking: the signed-in guest books for themselves
-- ---------------------------------------------------------------------------
create or replace function public.create_booking(
  p_cabin_id bigint,
  p_start_date date,
  p_end_date date,
  p_num_guests integer,
  p_observations text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_guest   public.guests%rowtype;
  v_quote   record;
  v_booking public.bookings%rowtype;
begin
  -- Raises when nobody is signed in; creates or links the guest otherwise
  v_guest := public.ensure_guest_profile();

  select * into v_quote
  from private.booking_quote(p_cabin_id, p_start_date, p_end_date, p_num_guests);

  insert into public.bookings (
    "cabinId", "guestId", "startDate", "endDate", "numGuests",
    "cabinPrice", "extrasPrice", "totalPrice",
    status, observations, source, "createdBy"
  )
  values (
    p_cabin_id, v_guest.id, p_start_date, p_end_date, p_num_guests,
    v_quote.cabin_price, 0, v_quote.cabin_price,
    'reserved', nullif(left(trim(p_observations), 1000), ''), 'website', auth.uid()
  )
  returning * into v_booking;

  return v_booking;
exception
  -- Two people confirming the same nights at the same moment: the
  -- no-overlap rule lets exactly one through
  when exclusion_violation then
    raise exception 'Someone has just booked some of these nights. Please choose other dates.'
      using errcode = '22023';
end;
$$;


-- ---------------------------------------------------------------------------
-- create_staff_booking: a walk-in or phone booking, by the front desk, under
-- exactly the same rules. The guest is one the hotel already has, or is
-- found or added by email.
-- ---------------------------------------------------------------------------
create or replace function public.create_staff_booking(
  p_cabin_id bigint,
  p_start_date date,
  p_end_date date,
  p_num_guests integer,
  p_source text,
  p_guest_id bigint default null,
  p_guest_full_name text default null,
  p_guest_email text default null,
  p_observations text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_guest_id bigint;
  v_quote    record;
  v_booking  public.bookings%rowtype;
begin
  if not public.is_staff() then
    raise exception 'Only staff can book for a guest' using errcode = '42501';
  end if;

  if p_source is null or p_source not in ('walk_in', 'phone') then
    raise exception 'Choose whether this is a walk-in or a phone booking' using errcode = '22023';
  end if;

  if p_guest_id is not null then
    select id into v_guest_id from public.guests where id = p_guest_id;

    if not found then
      raise exception 'That guest no longer exists' using errcode = '22023';
    end if;
  else
    if coalesce(trim(p_guest_full_name), '') = '' then
      raise exception 'Please enter the guest''s name' using errcode = '22023';
    end if;

    if p_guest_email is null or trim(p_guest_email) !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
      raise exception 'Please enter a valid email address' using errcode = '22023';
    end if;

    select id into v_guest_id
    from public.guests
    where lower(email) = lower(trim(p_guest_email));

    if not found then
      insert into public.guests ("fullName", email)
      values (trim(p_guest_full_name), trim(p_guest_email))
      returning id into v_guest_id;
    end if;
  end if;

  select * into v_quote
  from private.booking_quote(p_cabin_id, p_start_date, p_end_date, p_num_guests);

  insert into public.bookings (
    "cabinId", "guestId", "startDate", "endDate", "numGuests",
    "cabinPrice", "extrasPrice", "totalPrice",
    status, observations, source, "createdBy"
  )
  values (
    p_cabin_id, v_guest_id, p_start_date, p_end_date, p_num_guests,
    v_quote.cabin_price, 0, v_quote.cabin_price,
    'reserved', nullif(left(trim(p_observations), 1000), ''), p_source, auth.uid()
  )
  returning * into v_booking;

  return v_booking;
exception
  when exclusion_violation then
    raise exception 'Someone has just booked some of these nights. Please choose other dates.'
      using errcode = '22023';
end;
$$;


-- ---------------------------------------------------------------------------
-- update_booking: a guest changes the number of guests or the notes on their
-- own reservation, until the day before arrival
-- ---------------------------------------------------------------------------
create or replace function public.update_booking(
  p_booking_id bigint,
  p_num_guests integer,
  p_observations text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking public.bookings%rowtype;
  v_max     integer;
begin
  select b.* into v_booking
  from public.bookings b
  join public.guests g on g.id = b."guestId"
  where b.id = p_booking_id
    and g."authUserId" = auth.uid()
  for update of b;

  if not found then
    raise exception 'Reservation not found' using errcode = 'P0002';
  end if;

  if v_booking.status <> 'reserved' or v_booking."startDate" <= public.property_today() then
    raise exception 'This reservation can no longer be changed online. Please contact the front desk.'
      using errcode = '22023';
  end if;

  select least(c."maxCapacity", s."maxGuestsPerBooking") into v_max
  from public.cabins c
  cross join (select * from public.settings order by id limit 1) s
  where c.id = v_booking."cabinId";

  if p_num_guests is null or p_num_guests < 1 or p_num_guests > v_max then
    raise exception 'This cabin sleeps up to % guests', v_max using errcode = '22023';
  end if;

  update public.bookings
  set "numGuests" = p_num_guests,
      observations = nullif(left(trim(p_observations), 1000), '')
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;


-- ---------------------------------------------------------------------------
-- cancel_booking: the booking stays, marked cancelled, with when and who.
-- A guest can cancel their own until the day before arrival; staff can
-- cancel any reservation that hasn't started.
-- ---------------------------------------------------------------------------
create or replace function public.cancel_booking(p_booking_id bigint)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking  public.bookings%rowtype;
  v_is_staff boolean := public.is_staff();
begin
  if auth.uid() is null then
    raise exception 'You need to be signed in' using errcode = '28000';
  end if;

  select b.* into v_booking
  from public.bookings b
  where b.id = p_booking_id
    and (
      v_is_staff
      or b."guestId" in (
        select g.id from public.guests g where g."authUserId" = auth.uid()
      )
    )
  for update;

  if not found then
    raise exception 'Reservation not found' using errcode = 'P0002';
  end if;

  if v_booking.status <> 'reserved' then
    raise exception 'Only a reservation that hasn''t started can be cancelled'
      using errcode = '22023';
  end if;

  if not v_is_staff and v_booking."startDate" <= public.property_today() then
    raise exception 'Online cancellation closes the day before arrival. Please contact the front desk.'
      using errcode = '22023';
  end if;

  update public.bookings
  set status = 'cancelled',
      "cancelledAt" = now(),
      "cancelledBy" = auth.uid()
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;


-- ---------------------------------------------------------------------------
-- Who may call what
-- ---------------------------------------------------------------------------
revoke execute on function public.quote_booking(bigint, date, date, integer) from public;
revoke execute on function public.get_booked_dates(bigint) from public;
revoke execute on function public.property_today() from public;
grant execute on function public.quote_booking(bigint, date, date, integer) to anon, authenticated;
grant execute on function public.get_booked_dates(bigint) to anon, authenticated;
grant execute on function public.property_today() to anon, authenticated;

revoke execute on function public.create_booking(bigint, date, date, integer, text) from public, anon;
revoke execute on function public.create_staff_booking(bigint, date, date, integer, text, bigint, text, text, text) from public, anon;
revoke execute on function public.update_booking(bigint, integer, text) from public, anon;
revoke execute on function public.cancel_booking(bigint) from public, anon;
grant execute on function public.create_booking(bigint, date, date, integer, text) to authenticated;
grant execute on function public.create_staff_booking(bigint, date, date, integer, text, bigint, text, text, text) to authenticated;
grant execute on function public.update_booking(bigint, integer, text) to authenticated;
grant execute on function public.cancel_booking(bigint) to authenticated;


-- ---------------------------------------------------------------------------
-- Booking rows: guests read their own; staff read and update (check in,
-- check out, no-show, payment), with the status rules enforced by the
-- trigger; only an admin may delete one, to correct a mistake. Nobody
-- inserts directly: new bookings come from the functions above.
-- ---------------------------------------------------------------------------
drop policy if exists "Staff manage bookings" on public.bookings;

create policy "Staff see bookings"
  on public.bookings for select
  to authenticated
  using ((select public.is_staff()));

create policy "Staff update bookings"
  on public.bookings for update
  to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

create policy "Admins delete bookings"
  on public.bookings for delete
  to authenticated
  using ((select public.staff_role()) = 'admin');
