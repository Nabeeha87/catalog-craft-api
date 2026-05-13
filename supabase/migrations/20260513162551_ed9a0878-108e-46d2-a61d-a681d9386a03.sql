create extension if not exists pg_trgm;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  category text not null check (length(trim(category)) > 0),
  price numeric(12,2) not null check (price >= 0),
  description text not null default '',
  created_at timestamptz not null default now()
);

create index products_category_created_at_idx on public.products (category, created_at desc);
create index products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create index products_created_at_idx on public.products (created_at desc);

alter table public.products enable row level security;

-- Public catalog: anyone can read.
create policy "Products are publicly readable"
  on public.products for select
  using (true);

-- Writes are NOT allowed via the anon/auth keys directly.
-- All mutations go through TanStack server routes using the service-role client,
-- which bypasses RLS. No insert/update/delete policies are defined intentionally.