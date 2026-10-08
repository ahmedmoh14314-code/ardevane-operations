-- ===========================================================================
--  Dining menu
--
--  The small breakfast menu becomes a full one, in sections: breakfast,
--  lunch, dinner, desserts and drinks. Every dish can have a description
--  and a photo. Guests order any of it to their cabin, for a day and a time
--  of their stay.
--
--  So a food order is no longer a "breakfast" request but a "dining" one.
--  Everything else stays as it was: staff move it on (preparing, then
--  delivered), and a delivered order adds one charge to the folio.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. Sections, descriptions and photos for the dishes
-- ---------------------------------------------------------------------------
alter table public.services
  add column course text,
  add column description text,
  add column image text,
  add constraint services_course_check
    check (course in ('breakfast', 'lunch', 'dinner', 'desserts', 'drinks')),
  add constraint services_description_check
    check (description is null or length(description) <= 300);

update public.services set course = 'breakfast',
  description = 'Two eggs your way with toasted sourdough and butter.'
  where category = 'menu' and name = 'Eggs & Toast';
update public.services set course = 'breakfast',
  description = 'A stack of three with maple syrup and fresh berries.'
  where category = 'menu' and name = 'Pancakes';
update public.services set course = 'drinks',
  description = 'Filter coffee, freshly brewed.'
  where category = 'menu' and name = 'Coffee';
update public.services set course = 'drinks',
  description = 'Freshly squeezed orange juice.'
  where category = 'menu' and name = 'Juice';

insert into public.services (name, category, course, price, description) values
  -- Breakfast
  ('Falafel Plate', 'menu', 'breakfast', 11, 'Crispy falafel with hummus, tahini, olives, pickles, fresh vegetables and warm pita.'),
  ('Avocado Toast', 'menu', 'breakfast', 9, 'Smashed avocado on sourdough with a poached egg and chilli flakes.'),
  ('Granola Bowl', 'menu', 'breakfast', 7, 'Greek yogurt, house granola, honey and seasonal fruit.'),
  ('Croissant Basket', 'menu', 'breakfast', 6, 'Butter and chocolate croissants, baked this morning.'),
  ('Cheese Omelette', 'menu', 'breakfast', 9, 'Three eggs, mountain cheese and herbs, with a side salad.'),

  -- Lunch
  ('Grilled Lake Trout', 'menu', 'lunch', 18, 'Whole trout from the lake, lemon butter and new potatoes.'),
  ('Cabin Burger', 'menu', 'lunch', 15, 'Beef patty, cheddar, caramelised onions and fries.'),
  ('Chicken Caesar Salad', 'menu', 'lunch', 13, 'Grilled chicken, romaine, parmesan and garlic croutons.'),
  ('Lentil Soup', 'menu', 'lunch', 7, 'Red lentil soup with lemon and warm bread.'),
  ('Club Sandwich', 'menu', 'lunch', 12, 'Chicken, bacon, egg, tomato and lettuce, with fries.'),
  ('Margherita Flatbread', 'menu', 'lunch', 12, 'Wood-fired, with tomato, mozzarella and basil.'),
  ('Mushroom Risotto', 'menu', 'lunch', 16, 'Forest mushrooms, parmesan and a little truffle oil.'),

  -- Dinner
  ('Ribeye Steak', 'menu', 'dinner', 32, '300 g ribeye, peppercorn sauce, roasted vegetables.'),
  ('Slow-cooked Lamb Shank', 'menu', 'dinner', 28, 'Braised for hours, with mashed potatoes and gravy.'),
  ('Salmon Fillet', 'menu', 'dinner', 26, 'Pan-seared salmon, herb rice and greens.'),
  ('Chicken Shish', 'menu', 'dinner', 21, 'Grilled chicken skewers, bulgur pilaf and yogurt sauce.'),
  ('Wild Mushroom Pasta', 'menu', 'dinner', 19, 'Tagliatelle in a creamy mushroom sauce.'),
  ('Vegetable Curry', 'menu', 'dinner', 17, 'Seasonal vegetables in a mild coconut curry, with rice.'),
  ('Fireside Fondue for Two', 'menu', 'dinner', 34, 'Melted mountain cheese with bread, potatoes and pickles.'),

  -- Desserts
  ('Chocolate Lava Cake', 'menu', 'desserts', 9, 'Warm, with a soft centre and vanilla ice cream.'),
  ('Apple Crumble', 'menu', 'desserts', 8, 'Baked apples under a cinnamon crumble, with cream.'),
  ('Baklava', 'menu', 'desserts', 7, 'Layers of pastry, pistachios and syrup.'),
  ('Cheesecake', 'menu', 'desserts', 8, 'Baked cheesecake with a berry sauce.'),

  -- Drinks
  ('Turkish Tea', 'menu', 'drinks', 2, 'A pot of black tea, served the Turkish way.'),
  ('Hot Chocolate', 'menu', 'drinks', 4, 'Rich hot chocolate with whipped cream.'),
  ('Fresh Lemonade', 'menu', 'drinks', 4, 'Lemon, mint and a little sugar.'),
  ('Sparkling Water', 'menu', 'drinks', 3, 'A large bottle, chilled.');

-- The photos of the dishes, served by the guest website from its own
-- public folder
update public.services s
set image = v.image
from (values
  ('Falafel Plate', '/img/menu/falafel-plate.jpg'),
  ('Avocado Toast', '/img/menu/avocado-toast.jpg'),
  ('Granola Bowl', '/img/menu/granola-bowl.jpg'),
  ('Croissant Basket', '/img/menu/croissant-basket.jpg'),
  ('Cheese Omelette', '/img/menu/cheese-omelette.jpg'),
  ('Grilled Lake Trout', '/img/menu/grilled-lake-trout.jpg'),
  ('Cabin Burger', '/img/menu/cabin-burger.jpg'),
  ('Chicken Caesar Salad', '/img/menu/chicken-caesar-salad.jpg'),
  ('Lentil Soup', '/img/menu/lentil-soup.jpg'),
  ('Club Sandwich', '/img/menu/club-sandwich.jpg'),
  ('Margherita Flatbread', '/img/menu/margherita-flatbread.jpg'),
  ('Mushroom Risotto', '/img/menu/mushroom-risotto.jpg'),
  ('Ribeye Steak', '/img/menu/ribeye-steak.jpg'),
  ('Slow-cooked Lamb Shank', '/img/menu/lamb-shank.jpg'),
  ('Salmon Fillet', '/img/menu/salmon-fillet.jpg'),
  ('Chicken Shish', '/img/menu/chicken-shish.jpg'),
  ('Wild Mushroom Pasta', '/img/menu/wild-mushroom-pasta.jpg'),
  ('Vegetable Curry', '/img/menu/vegetable-curry.jpg'),
  ('Fireside Fondue for Two', '/img/menu/fondue-for-two.jpg'),
  ('Chocolate Lava Cake', '/img/menu/chocolate-lava-cake.jpg'),
  ('Apple Crumble', '/img/menu/apple-crumble.jpg'),
  ('Baklava', '/img/menu/baklava.jpg'),
  ('Cheesecake', '/img/menu/cheesecake.jpg'),
  ('Coffee', '/img/menu/coffee.jpg'),
  ('Juice', '/img/menu/juice.jpg'),
  ('Turkish Tea', '/img/menu/turkish-tea.jpg'),
  ('Hot Chocolate', '/img/menu/hot-chocolate.jpg'),
  ('Fresh Lemonade', '/img/menu/fresh-lemonade.jpg'),
  ('Sparkling Water', '/img/menu/sparkling-water.jpg')
) as v(name, image)
where s.category = 'menu' and s.name = v.name;

-- The two first breakfast dishes have no photo yet, so they leave the
-- menu. Orders that had them keep their names and prices.
delete from public.services
where category = 'menu' and name in ('Eggs & Toast', 'Pancakes');

-- Every dish on the menu belongs to a section
alter table public.services
  add constraint services_menu_course_check
    check (category <> 'menu' or course is not null);


-- ---------------------------------------------------------------------------
-- 2. A food order is a "dining" request now
-- ---------------------------------------------------------------------------
alter table public.requests drop constraint requests_type_check;
update public.requests set type = 'dining' where type = 'breakfast';
alter table public.requests
  add constraint requests_type_check
    check (type in ('dining', 'housekeeping', 'support', 'maintenance'));

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

  if p_type is null or p_type not in ('dining', 'housekeeping', 'support', 'maintenance') then
    raise exception 'Please choose what you need' using errcode = '22023';
  end if;

  if p_type = 'dining' then
    if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
      raise exception 'Please choose something from the menu' using errcode = '22023';
    end if;

    if p_requested_date is not null
       and (p_requested_date < v_booking."startDate" or p_requested_date > v_booking."endDate") then
      raise exception 'Please choose a day of your stay' using errcode = '22023';
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
    coalesce(v_title, 'Dining'),
    nullif(left(trim(p_note), 1000), ''),
    case when p_type = 'maintenance' and p_priority = 'urgent' then 'urgent' else 'normal' end,
    case when p_type = 'dining' then p_requested_for end,
    case when p_type = 'dining' then p_requested_date end,
    auth.uid()
  )
  returning * into v_request;

  if p_type = 'dining' then
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

-- The charge a delivered order adds to the folio
create or replace function private.charge_completed_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total numeric;
begin
  select sum("unitPrice" * quantity) into v_total
  from public.request_items
  where "requestId" = new.id;

  if coalesce(v_total, 0) > 0 then
    insert into public.charges ("bookingId", description, amount, "createdBy", "requestId")
    values (
      new."bookingId",
      left('Dining: ' || new.title, 120),
      v_total,
      auth.uid(),
      new.id
    )
    on conflict ("requestId") do nothing;
  end if;

  return new;
end;
$$;
