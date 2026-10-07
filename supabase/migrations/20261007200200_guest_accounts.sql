-- ===========================================================================
--  Guest accounts
--
--  A guest row can now belong to a sign-in account (email and password, or
--  Google, both through Supabase Auth). Walk-in and phone guests created by
--  staff simply have no account: authUserId stays empty.
--
--  One email address is one guest. When someone signs up with an email the
--  hotel already knows, their account takes over that guest and its history.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. One guest per email address
--    Older data may hold the same guest twice. Their bookings move to the
--    oldest row and the copies are removed, so the unique index can exist.
-- ---------------------------------------------------------------------------
with ranked as (
  select
    id,
    min(id) over (partition by lower(email)) as keep_id
  from public.guests
  where email is not null
)
update public.bookings b
set "guestId" = r.keep_id
from ranked r
where b."guestId" = r.id
  and r.id <> r.keep_id;

delete from public.guests g
using public.guests older
where lower(g.email) = lower(older.email)
  and g.id > older.id;

alter table public.guests
  alter column email set not null,
  alter column "fullName" set not null;

create unique index guests_email_key on public.guests (lower(email));


-- ---------------------------------------------------------------------------
-- 2. The link between a guest and their sign-in account
-- ---------------------------------------------------------------------------
alter table public.guests
  add column "authUserId" uuid unique references auth.users (id) on delete set null;

comment on column public.guests."authUserId" is
  'The guest''s own sign-in account. Empty for guests booked in by staff.';


-- ---------------------------------------------------------------------------
-- 3. ensure_guest_profile()
--    Called by the guest website right after every sign in. Returns the
--    guest that belongs to the signed-in account, creating or linking it on
--    the first visit. The identity always comes from auth.uid(), never from
--    anything the browser sends.
-- ---------------------------------------------------------------------------
create or replace function public.ensure_guest_profile()
returns public.guests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_user    auth.users%rowtype;
  v_guest   public.guests%rowtype;
begin
  if v_user_id is null then
    raise exception 'You need to be signed in' using errcode = '28000';
  end if;

  select * into v_guest
  from public.guests
  where "authUserId" = v_user_id;

  if found then
    return v_guest;
  end if;

  select * into v_user
  from auth.users
  where id = v_user_id;

  -- Only a confirmed address may take over a guest the hotel already knows
  if v_user.email is null or v_user.email_confirmed_at is null then
    raise exception 'Please confirm your email address first' using errcode = '28000';
  end if;

  update public.guests
  set "authUserId" = v_user_id
  where lower(email) = lower(v_user.email)
    and "authUserId" is null
  returning * into v_guest;

  if found then
    return v_guest;
  end if;

  insert into public.guests ("authUserId", email, "fullName")
  values (
    v_user_id,
    v_user.email,
    coalesce(
      nullif(trim(v_user.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(v_user.raw_user_meta_data ->> 'name'), ''),
      split_part(v_user.email, '@', 1)
    )
  )
  returning * into v_guest;

  return v_guest;
end;
$$;

revoke execute on function public.ensure_guest_profile() from public, anon;
grant execute on function public.ensure_guest_profile() to authenticated;


-- ---------------------------------------------------------------------------
-- 4. update_guest_profile()
--    The only way a guest changes their own details. Guests get no direct
--    update rights on the table, so they can never touch email, name or the
--    account link.
-- ---------------------------------------------------------------------------
create or replace function public.update_guest_profile(
  p_nationality  text,
  p_country_flag text,
  p_national_id  text
)
returns public.guests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_guest public.guests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'You need to be signed in' using errcode = '28000';
  end if;

  if coalesce(trim(p_nationality), '') = '' then
    raise exception 'Please choose your country from the list' using errcode = '22023';
  end if;

  if p_country_flag is null or p_country_flag not like 'https://flagcdn.com/%' then
    raise exception 'Please choose your country from the list' using errcode = '22023';
  end if;

  if p_national_id is null or p_national_id !~ '^[A-Za-z0-9]{6,12}$' then
    raise exception 'National ID must be 6 to 12 letters or numbers' using errcode = '22023';
  end if;

  update public.guests
  set nationality   = trim(p_nationality),
      "countryFlag" = p_country_flag,
      "nationalID"  = p_national_id
  where "authUserId" = auth.uid()
  returning * into v_guest;

  if not found then
    raise exception 'No guest profile for this account' using errcode = 'P0002';
  end if;

  return v_guest;
end;
$$;

revoke execute on function public.update_guest_profile(text, text, text) from public, anon;
grant execute on function public.update_guest_profile(text, text, text) to authenticated;
