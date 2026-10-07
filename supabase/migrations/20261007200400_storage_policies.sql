-- ===========================================================================
--  Storage policies
--
--  Both buckets are public, so their files load by URL for anyone without
--  any policy. What needs locking is writing: anyone with the publishable
--  key could upload, and in the leftover cabin-image bucket also replace
--  and delete. From now on only staff can write, and the two leftover
--  buckets from the course project are closed.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Drop every existing policy that mentions any of the four buckets
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        coalesce(qual, '') ~ '(cabin-image|avatar)'
        or coalesce(with_check, '') ~ '(cabin-image|avatar)'
      )
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end;
$$;


-- ---------------------------------------------------------------------------
-- 2. The buckets in use stay public. The course project's leftovers (nothing
--    in either app uses them) become private, so with no policy left nobody
--    can read or write them. Remove them from the dashboard when convenient.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('cabin-images', 'cabin-images', true),
  ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

update storage.buckets
set public = false
where id in ('cabin-image', 'avatar');


-- ---------------------------------------------------------------------------
-- 3. Staff list, upload, replace and delete. Everyone else only reads files
--    through their public URLs.
-- ---------------------------------------------------------------------------
create policy "Staff list cabin photos and avatars"
  on storage.objects for select
  to authenticated
  using (
    bucket_id in ('cabin-images', 'avatars')
    and (select public.is_staff())
  );

create policy "Staff upload cabin photos and avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('cabin-images', 'avatars')
    and (select public.is_staff())
  );

create policy "Staff replace cabin photos and avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('cabin-images', 'avatars')
    and (select public.is_staff())
  )
  with check (
    bucket_id in ('cabin-images', 'avatars')
    and (select public.is_staff())
  );

create policy "Staff delete cabin photos and avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('cabin-images', 'avatars')
    and (select public.is_staff())
  );
