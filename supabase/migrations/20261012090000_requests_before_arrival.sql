-- ===========================================================================
--  Requests before arrival
--
--  Guests no longer have to wait for check-in to ask for things. A guest
--  with a confirmed reservation that hasn't ended can order breakfast or ask
--  for anything else ahead of their stay, the same as a guest who is
--  already checked in.
--
--  The request goes to the stay the guest is in now, or else to their next
--  confirmed one. A booking request that the hotel hasn't approved yet
--  can't have any, and neither can a stay that has ended, been cancelled
--  or missed.
--
--  Breakfast can now say which morning it is for, as well as what time.
-- ===========================================================================

alter table public.requests add column "requestedDate" date;

drop function public.create_stay_request(text, text, text, text, time, jsonb);

create or replace function public.create_stay_request(
  p_type text,
  p_title text default null,
  p_note text default null,
  p_priority text default 'normal',
  p_requested_for time default null,
  p_items jsonb default null,
  p_requested_date date default null
)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking    public.bookings%rowtype;
  v_request    public.requests%rowtype;
  v_item       jsonb;
  v_service    public.services%rowtype;
  v_quantity   integer;
  v_title      text := nullif(left(trim(p_title), 120), '');
  v_names      text[] := '{}';
begin
  if auth.uid() is null then
    raise exception 'You need to be signed in' using errcode = '28000';
  end if;

  -- The stay the guest is in now, or else their next confirmed one
  select b.* into v_booking
  from public.bookings b
  join public.guests g on g.id = b."guestId"
  where g."authUserId" = auth.uid()
    and (
      b.status = 'checked_in'
      or (b.status = 'reserved' and b."endDate" > public.property_today())
    )
  order by (b.status = 'checked_in') desc, b."startDate"
  limit 1;

  if not found then
    raise exception 'Requests open once your booking is confirmed' using errcode = '22023';
  end if;

  if p_type is null or p_type not in ('breakfast', 'housekeeping', 'support', 'maintenance') then
    raise exception 'Please choose what you need' using errcode = '22023';
  end if;

  if p_type = 'breakfast' then
    if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
      raise exception 'Please choose something from the menu' using errcode = '22023';
    end if;

    if p_requested_date is not null
       and (p_requested_date < v_booking."startDate" or p_requested_date > v_booking."endDate") then
      raise exception 'Please choose a morning during your stay' using errcode = '22023';
    end if;
  elsif v_title is null then
    raise exception 'Please say what you need' using errcode = '22023';
  end if;

  insert into public.requests (
    "bookingId", type, title, note, priority, "requestedFor", "requestedDate", "createdBy"
  )
  values (
    v_booking.id,
    p_type,
    coalesce(v_title, 'Breakfast'),
    nullif(left(trim(p_note), 1000), ''),
    case when p_type = 'maintenance' and p_priority = 'urgent' then 'urgent' else 'normal' end,
    case when p_type = 'breakfast' then p_requested_for end,
    case when p_type = 'breakfast' then p_requested_date end,
    auth.uid()
  )
  returning * into v_request;

  if p_type = 'breakfast' then
    for v_item in select * from jsonb_array_elements(p_items) loop
      select * into v_service
      from public.services
      where id = (v_item ->> 'serviceId')::bigint
        and category = 'menu'
        and "isActive";

      if not found then
        raise exception 'That dish is not on the menu any more' using errcode = '22023';
      end if;

      v_quantity := coalesce((v_item ->> 'quantity')::integer, 1);

      if v_quantity < 1 or v_quantity > 20 then
        raise exception 'Choose between 1 and 20 of each dish' using errcode = '22023';
      end if;

      insert into public.request_items ("requestId", "serviceId", name, "unitPrice", quantity)
      values (v_request.id, v_service.id, v_service.name, v_service.price, v_quantity);

      v_names := v_names || (v_service.name || ' × ' || v_quantity);
    end loop;

    -- The title says what was ordered, so every list can show it as is
    update public.requests
    set title = left(array_to_string(v_names, ', '), 120)
    where id = v_request.id
    returning * into v_request;
  end if;

  return v_request;
end;
$$;

revoke execute on function public.create_stay_request(text, text, text, text, time, jsonb, date) from public, anon;
grant execute on function public.create_stay_request(text, text, text, text, time, jsonb, date) to authenticated;
