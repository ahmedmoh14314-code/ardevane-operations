-- ===========================================================================
--  Staff membership
--
--  Until now every signed-in account was treated as staff. Guests are about
--  to get accounts of their own, so being signed in can no longer mean
--  anything on its own. From here on, staff are the accounts listed in
--  staff_members, and only while isActive is true.
-- ===========================================================================

create table public.staff_members (
  "userId"    uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  "fullName"  text,
  role        text not null default 'front_desk'
              check (role in ('admin', 'front_desk', 'housekeeping', 'maintenance')),
  "isActive"  boolean not null default true
);

comment on table public.staff_members is
  'Accounts that may use Ardevane Operations. Signing in alone gives no staff access.';


-- ---------------------------------------------------------------------------
-- Helpers used by every access policy.
-- security definer so they can read staff_members without tripping over the
-- table's own policies; search_path is empty so nothing can be swapped in.
-- ---------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_members s
    where s."userId" = (select auth.uid())
      and s."isActive"
  );
$$;

create or replace function public.staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select s.role
  from public.staff_members s
  where s."userId" = (select auth.uid())
    and s."isActive";
$$;


-- ---------------------------------------------------------------------------
-- Who can see and change the team
-- ---------------------------------------------------------------------------
alter table public.staff_members enable row level security;

-- Anyone signed in may look up their own row. That is how Operations tells a
-- member of staff from a guest at sign in (a guest simply gets no row back).
create policy "Members see their own membership"
  on public.staff_members for select
  to authenticated
  using ("userId" = (select auth.uid()));

create policy "Admins see the whole team"
  on public.staff_members for select
  to authenticated
  using ((select public.staff_role()) = 'admin');

create policy "Admins add staff"
  on public.staff_members for insert
  to authenticated
  with check ((select public.staff_role()) = 'admin');

create policy "Admins change staff"
  on public.staff_members for update
  to authenticated
  using ((select public.staff_role()) = 'admin')
  with check ((select public.staff_role()) = 'admin');

create policy "Admins remove staff"
  on public.staff_members for delete
  to authenticated
  using ((select public.staff_role()) = 'admin');


-- ---------------------------------------------------------------------------
-- Bootstrap
-- Every account that exists before this migration was created from the
-- Operations Team page, so each one keeps its access, as an admin.
-- On a brand-new project there are no accounts yet and nothing happens; see
-- the README for making the first admin.
-- ---------------------------------------------------------------------------
insert into public.staff_members ("userId", "fullName", role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'fullName', u.email),
  'admin'
from auth.users u
on conflict ("userId") do nothing;
