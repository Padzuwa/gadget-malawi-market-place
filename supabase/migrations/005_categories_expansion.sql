-- ============================================================
-- Gadget Malawi — Expanded category coverage
-- Adds 7 new categories and reorders all of them.
-- Idempotent: safe to re-run.
-- ============================================================

insert into public.categories (name, slug, icon, sort_order) values
  ('Phones',              'phones',              'mobile-screen',        10),
  ('Tablets',             'tablets',             'tablet-screen-button', 20),
  ('Laptops',             'laptops',             'laptop',               30),
  ('Desktops',            'desktops',            'desktop',              40),
  ('Monitors',            'monitors',            'display',              50),
  ('PC Parts',            'pc-parts',            'microchip',            60),
  ('Storage',             'storage',             'hard-drive',           70),
  ('Networking',          'networking',          'wifi',                 80),
  ('Printers & Scanners', 'printers-scanners',   'print',                90),
  ('Audio',               'audio',               'volume-high',         100),
  ('Cameras',             'cameras',             'camera',              110),
  ('Gaming',              'gaming',              'gamepad',             120),
  ('Accessories',         'accessories',         'keyboard',            130),
  ('Power & Solar',       'power-solar',         'bolt',                140),
  ('Other Electronics',   'other-electronics',   'plug',                999)
on conflict (name) do update
  set sort_order = excluded.sort_order,
      icon = excluded.icon;

-- Confirm
select name, slug, sort_order from public.categories order by sort_order;