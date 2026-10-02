-- ===========================================================================
--  The Wild Oasis — Supabase setup
--  SQL Editor -> New query -> paste -> Run.  Safe to run more than once.
--
--  The editor runs the whole script in ONE transaction, so a single failing
--  statement rolls everything back. Every risky step below is therefore
--  wrapped in its own DO block with an exception handler, which keeps a
--  failure local instead of undoing the rest.
--
--  When it finishes, read the NOTICE output ("Messages" tab) and the result
--  grid at the bottom. Anything that says SKIPPED needs doing by hand.
--
--  SECURITY: these policies let anyone with the publishable key read and
--  write these tables. Fine for a course project, not for real data.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- STEP 1 — column names
--   The tables were created with typos, so the app asks for columns that do
--   not exist (cabins.maxCapacity vs the actual cabins.maxCapactiy, etc).
-- ---------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select * from (values
      ('cabins',   'maxCapactiy',        'maxCapacity'),
      ('cabins',   'disconut',           'discount'),
      ('cabins',   'imge',               'image'),
      ('guests',   'nationaltiy',        'nationality'),
      ('settings', 'maxBookingLenght',   'maxBookingLength'),
      ('settings', 'maxGuestPerBooking', 'maxGuestsPerBooking'),
      ('bookings', 'cabinID',            'cabinId'),
      ('bookings', 'gusetID',            'guestId'),
      ('bookings', 'extraPrice',         'extrasPrice')
    ) as t(tbl, old_name, new_name)
  loop
    begin
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = r.tbl
          and column_name = r.old_name
      ) then
        execute format('alter table public.%I rename column %I to %I',
                       r.tbl, r.old_name, r.new_name);
        raise notice 'STEP1 renamed %.% -> %', r.tbl, r.old_name, r.new_name;
      else
        raise notice 'STEP1 %.% already fine', r.tbl, r.new_name;
      end if;
    exception when others then
      raise notice 'STEP1 SKIPPED %.% : %', r.tbl, r.old_name, sqlerrm;
    end;
  end loop;
end $$;

do $$
begin
  alter table public.bookings add column if not exists "numNights" integer;
  raise notice 'STEP1 bookings.numNights present';
exception when others then
  raise notice 'STEP1 SKIPPED numNights : %', sqlerrm;
end $$;


-- ---------------------------------------------------------------------------
-- STEP 2 — row level security on the four tables
--   SELECT / UPDATE / DELETE already work; INSERT is refused with
--   "42501: new row violates row-level security policy", which is what stops
--   the sample-data Uploader.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['cabins', 'guests', 'bookings', 'settings']
  loop
    begin
      execute format('alter table public.%I enable row level security', t);

      execute format('drop policy if exists "oasis read %s"   on public.%I', t, t);
      execute format('drop policy if exists "oasis insert %s" on public.%I', t, t);
      execute format('drop policy if exists "oasis update %s" on public.%I', t, t);
      execute format('drop policy if exists "oasis delete %s" on public.%I', t, t);

      execute format('create policy "oasis read %s"   on public.%I for select to anon, authenticated using (true)',      t, t);
      execute format('create policy "oasis insert %s" on public.%I for insert to anon, authenticated with check (true)', t, t);
      execute format('create policy "oasis update %s" on public.%I for update to anon, authenticated using (true) with check (true)', t, t);
      execute format('create policy "oasis delete %s" on public.%I for delete to anon, authenticated using (true)',      t, t);

      raise notice 'STEP2 policies set on %', t;
    exception when others then
      raise notice 'STEP2 SKIPPED % : %', t, sqlerrm;
    end;
  end loop;
end $$;


-- ---------------------------------------------------------------------------
-- STEP 3 — storage buckets
--   There are no buckets at all yet, but data-cabins.js builds every image
--   URL as  <supabaseUrl>/storage/v1/object/public/cabin-images/...
--   If this says SKIPPED, create the buckets by hand instead:
--     Storage -> New bucket -> name "cabin-images", toggle Public -> Save
--     Storage -> New bucket -> name "avatars",      toggle Public -> Save
-- ---------------------------------------------------------------------------
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('cabin-images', 'cabin-images', true), ('avatars', 'avatars', true)
  on conflict (id) do update set public = true;
  raise notice 'STEP3 buckets created';
exception when others then
  raise notice 'STEP3 SKIPPED buckets : % -- create them in the Storage tab', sqlerrm;
end $$;


-- ---------------------------------------------------------------------------
-- STEP 4 — storage policies
--   storage.objects is owned by supabase_storage_admin, so this is the step
--   most likely to fail with "must be owner of table objects".
--   If it says SKIPPED, do it in the dashboard instead:
--     Storage -> Policies -> storage.objects -> New policy
--     -> "For full customization", allow SELECT + INSERT for anon
--   Making both buckets PUBLIC already covers reading, so uploads are the
--   only thing that really needs a policy.
-- ---------------------------------------------------------------------------
do $$
begin
  drop policy if exists "oasis storage read"   on storage.objects;
  drop policy if exists "oasis storage write"  on storage.objects;
  drop policy if exists "oasis storage update" on storage.objects;
  drop policy if exists "oasis storage delete" on storage.objects;

  create policy "oasis storage read" on storage.objects
    for select to anon, authenticated
    using (bucket_id in ('cabin-images', 'avatars'));

  create policy "oasis storage write" on storage.objects
    for insert to anon, authenticated
    with check (bucket_id in ('cabin-images', 'avatars'));

  create policy "oasis storage update" on storage.objects
    for update to anon, authenticated
    using (bucket_id in ('cabin-images', 'avatars'))
    with check (bucket_id in ('cabin-images', 'avatars'));

  create policy "oasis storage delete" on storage.objects
    for delete to anon, authenticated
    using (bucket_id in ('cabin-images', 'avatars'));

  raise notice 'STEP4 storage policies set';
exception when others then
  raise notice 'STEP4 SKIPPED storage policies : % -- do it in Storage > Policies', sqlerrm;
end $$;


-- ---------------------------------------------------------------------------
-- STEP 5 — verification. Every row must read OK.
-- ---------------------------------------------------------------------------
with expected(item, present) as (
  select 'cabins.maxCapacity',          count(*) from information_schema.columns where table_schema='public' and table_name='cabins'   and column_name='maxCapacity'
  union all select 'cabins.discount',            count(*) from information_schema.columns where table_schema='public' and table_name='cabins'   and column_name='discount'
  union all select 'cabins.image',               count(*) from information_schema.columns where table_schema='public' and table_name='cabins'   and column_name='image'
  union all select 'guests.nationality',         count(*) from information_schema.columns where table_schema='public' and table_name='guests'   and column_name='nationality'
  union all select 'settings.maxBookingLength',  count(*) from information_schema.columns where table_schema='public' and table_name='settings' and column_name='maxBookingLength'
  union all select 'settings.maxGuestsPerBooking', count(*) from information_schema.columns where table_schema='public' and table_name='settings' and column_name='maxGuestsPerBooking'
  union all select 'bookings.cabinId',           count(*) from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='cabinId'
  union all select 'bookings.guestId',           count(*) from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='guestId'
  union all select 'bookings.extrasPrice',       count(*) from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='extrasPrice'
  union all select 'bookings.numNights',         count(*) from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='numNights'
  union all select 'insert policy: cabins',      count(*) from pg_policies where schemaname='public' and tablename='cabins'   and cmd='INSERT'
  union all select 'insert policy: guests',      count(*) from pg_policies where schemaname='public' and tablename='guests'   and cmd='INSERT'
  union all select 'insert policy: bookings',    count(*) from pg_policies where schemaname='public' and tablename='bookings' and cmd='INSERT'
  union all select 'insert policy: settings',    count(*) from pg_policies where schemaname='public' and tablename='settings' and cmd='INSERT'
  union all select 'bucket cabin-images',        count(*) from storage.buckets where id='cabin-images'
  union all select 'bucket avatars',             count(*) from storage.buckets where id='avatars'
)
select item, case when present > 0 then 'OK' else '*** STILL MISSING ***' end as status
from expected;
