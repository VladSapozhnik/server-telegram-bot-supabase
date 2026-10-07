-- Migration: create articles table
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger for auto updated_at
create or replace function public.update_articles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
  before update on public.articles
  for each row
  execute function public.update_articles_updated_at();

-- Enable RLS
alter table public.articles enable row level security;

-- Policy for select (public read or service role)
create policy "Allow all read articles" on public.articles
  for select
  using (true);

-- Policy for insert/update/delete (service role or public for demo)
create policy "Allow all insert articles" on public.articles
  for insert
  with check (true);

create policy "Allow all update articles" on public.articles
  for update
  using (true);

create policy "Allow all delete articles" on public.articles
  for delete
  using (true);
