-- ===========================================================================
--  Cabin condition
--
--  Each cabin now says what state it is in, for the people who look after
--  it:
--
--    ready            clean and fine
--    dirty            a guest has left; it needs cleaning
--    cleaning         someone is cleaning it now
--    out_of_service   it can't be used (broken, repairs…)
--
--  "Occupied" is not a condition. A cabin is occupied while one of its
--  bookings is checked in; that comes from the bookings, so a cabin can be
--  ready and occupied at the same time.
--
--  The one automatic change: checking a guest out makes the cabin dirty.
--  Everything else is changed by staff from the Cabins page.
-- ===========================================================================

alter table public.cabins
  add column condition text not null default 'ready',
  add constraint cabins_condition_check
    check (condition in ('ready', 'dirty', 'cleaning', 'out_of_service'));


-- ---------------------------------------------------------------------------
-- Checkout leaves the cabin dirty. It runs with the function owner's
-- rights, so the cabin is updated whoever checks the guest out.
-- ---------------------------------------------------------------------------
create or replace function private.dirty_cabin_on_checkout()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.cabins
  set condition = 'dirty'
  where id = new."cabinId";

  return new;
end;
$$;

create trigger bookings_checkout_dirties_cabin
  after update of status on public.bookings
  for each row
  when (old.status = 'checked_in' and new.status = 'checked_out')
  execute function private.dirty_cabin_on_checkout();
