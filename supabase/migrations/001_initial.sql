-- Aesthetic Dine — initial schema

create type restaurant_status as enum ('draft', 'live', 'suspended');
create type subscription_status as enum ('active', 'expired', 'pending');
create type request_status as enum ('new', 'in_review', 'building', 'live', 'rejected');

create table restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  about text,
  cuisine text,
  phone text,
  whatsapp text,
  email text,
  facebook text,
  address text,
  hours text,
  map_embed_url text,
  hero_image text,
  theme text default 'warm' check (theme in ('warm', 'classic', 'modern')),
  status restaurant_status default 'draft',
  subscription_status subscription_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  sort_order int default 0
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_available boolean default true,
  sort_order int default 0
);

create table client_requests (
  id uuid primary key default gen_random_uuid(),
  restaurant_name text not null,
  owner_name text not null,
  phone text not null,
  email text not null,
  cuisine text,
  preferred_slug text,
  description text,
  plan text default 'starter',
  special_requests text,
  status request_status default 'new',
  restaurant_id uuid references restaurants(id),
  created_at timestamptz default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  plan text not null,
  amount_bdt numeric(10,2) not null,
  period_start date,
  period_end date,
  payment_method text,
  status subscription_status default 'pending',
  created_at timestamptz default now()
);

-- RLS (enable after Supabase auth setup)
alter table restaurants enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table client_requests enable row level security;
alter table subscriptions enable row level security;

-- Public read for live restaurants
create policy "Public read live restaurants" on restaurants
  for select using (status = 'live' and subscription_status = 'active');

-- Public insert client requests
create policy "Public insert client requests" on client_requests
  for insert with check (true);
