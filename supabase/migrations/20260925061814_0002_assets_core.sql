create table public.assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  status text not null default 'draft',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assets_title_not_blank check (length(btrim(title)) > 0),
  constraint assets_status_v1 check (status in ('draft', 'published'))
);

alter table public.assets enable row level security;

create policy "assets_select_own"
on public.assets
for select
to authenticated
using (created_by = (select auth.uid()));

create policy "assets_insert_own"
on public.assets
for insert
to authenticated
with check (created_by = (select auth.uid()));

create policy "assets_update_own"
on public.assets
for update
to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));
