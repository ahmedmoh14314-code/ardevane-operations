-- ===========================================================================
--  Booking requests
--
--  A booking made on the website is now a request: it starts as "pending"
--  and the hotel approves it (→ reserved) or declines it (→ cancelled).
--  Bookings the front desk makes (walk-in, phone) are reserved at once, as
--  before.
--
--  A pending request holds its nights, so nobody else can book them while
--  the hotel decides. The guest can still change or withdraw it until the
--  day before arrival, the same as a reservation.
--
--    pending → reserved      approved by staff
--    pending → cancelled     declined by staff, or withdrawn by the guest
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. The new status
-- ---------------------------------------------------------------------------
alter table public.bookings drop constraint bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check
    check (status in ('pending', 'reserved', 'checked_in', 'checked_out', 'cancelled', 'no_show'));


-- ---------------------------------------------------------------------------
-- 2. The status rules, with the two new steps
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
    (old.status = 'pending' and new.status in ('reserved', 'cancelled'))
    or (old.status = 'reserved' and new.status in ('checked_in', 'cancelled', 'no_show'))
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


-- ---------------------------------------------------------------------------
-- 3. create_booking: a guest's booking starts as a request
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
    'pending', nullif(left(trim(p_observations), 1000), ''), 'website', auth.uid()
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
-- 4. update_booking: a guest may change a request or a reservation, until
--    the day before arrival
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

  if v_booking.status not in ('pending', 'reserved')
     or v_booking."startDate" <= public.property_today() then
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
-- 5. cancel_booking: also withdraws (guest) or declines (staff) a request
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

  if v_booking.status not in ('pending', 'reserved') then
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
