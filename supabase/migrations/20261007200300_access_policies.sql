-- ===========================================================================
--  Access policies
--
--  Replaces "anyone signed in can do anything" with three audiences:
--
--    everyone (signed in or not)  open cabins, their photos, the house rules
--    a guest                      their own guest row and their own bookings
--    staff                        everything, through staff_members
--
--  Guests change nothing directly. Their profile goes through
--  update_guest_profile(); bookings still go through the guest website's
--  server until the booking functions arrive in the next phase.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Start clean: drop every policy these tables had before, whatever its
--    name (the old "employees …" ones and the website's read policies).
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('cabins', 'cabin_images', 'guests', 'bookings', 'settings')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end;
$$;

alter table public.cabins       enable row level security;
alter table public.cabin_images enable row level security;
alter table public.guests       enable row level security;
alter table public.bookings     enable row level security;
alter table public.settings     enable row level security;


-- ---------------------------------------------------------------------------
-- 2. Cabins and their photos: public while the cabin is open for booking
-- ---------------------------------------------------------------------------
create policy "Anyone sees open cabins"
  on public.cabins for select
  to anon, authenticated
  using (is_active);

create policy "Staff manage cabins"
  on public.cabins for all
  to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

create policy "Anyone sees photos of open cabins"
  on public.cabin_images for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.cabins c
      where c.id = cabin_images."cabinId"
        and c.is_active
    )
  );

create policy "Staff manage cabin photos"
  on public.cabin_images for all
  to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));


-- ---------------------------------------------------------------------------
-- 3. Settings: the house rules are public, only an admin changes them
-- ---------------------------------------------------------------------------
create policy "Anyone reads the house rules"
  on public.settings for select
  to anon, authenticated
  using (true);

create policy "Admins change the house rules"
  on public.settings for update
  to authenticated
  using ((select public.staff_role()) = 'admin')
  with check ((select public.staff_role()) = 'admin');


-- ---------------------------------------------------------------------------
-- 4. Guests: a guest sees their own row, staff see everyone
-- ---------------------------------------------------------------------------
create policy "Guests see their own profile"
  on public.guests for select
  to authenticated
  using ("authUserId" = (select auth.uid()));

create policy "Staff manage guests"
  on public.guests for all
  to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));


-- ---------------------------------------------------------------------------
-- 5. Bookings: a guest sees their own, staff see and change all of them
-- ---------------------------------------------------------------------------
create policy "Guests see their own bookings"
  on public.bookings for select
  to authenticated
  using (
    "guestId" in (
      select g.id
      from public.guests g
      where g."authUserId" = (select auth.uid())
    )
  );

create policy "Staff manage bookings"
  on public.bookings for all
  to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));


-- ---------------------------------------------------------------------------
-- 6. The bookings search view runs with the caller's rights
--    (security_invoker), so the policies above apply to it too. Nobody who
--    is signed out needs it.
-- ---------------------------------------------------------------------------
revoke all on public.bookings_search from anon;
grant select on public.bookings_search to authenticated;
