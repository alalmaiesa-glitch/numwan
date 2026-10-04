create table if not exists public.store_campaign_assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products(id) on delete cascade,
  asset_key text not null,
  phase text not null,
  channel text not null,
  language text not null,
  use_case_slug text,
  headline text,
  body text not null,
  target_path text not null,
  utm_source text not null,
  utm_medium text not null,
  utm_campaign text not null,
  utm_content text not null,
  status text not null default 'READY',
  sequence_order integer not null default 100,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_campaign_assets_phase_check check (
    phase in ('PRELAUNCH','LAUNCH','FOLLOW_UP')
  ),
  constraint store_campaign_assets_channel_check check (
    channel in ('LINKEDIN','X','EMAIL_LEADS','TARGET_ACCOUNT')
  ),
  constraint store_campaign_assets_language_check check (
    language in ('ar','en')
  ),
  constraint store_campaign_assets_status_check check (
    status in ('READY','BLOCKED_PAYMENT','SCHEDULED','PUBLISHED','PAUSED')
  ),
  unique(product_id,asset_key)
);

alter table public.store_campaign_assets enable row level security;

revoke all on table public.store_campaign_assets from anon,authenticated;
grant select,insert,update,delete on table public.store_campaign_assets to authenticated;
grant select,insert,update,delete on table public.store_campaign_assets to service_role;

drop policy if exists store_campaign_assets_owner_select on public.store_campaign_assets;
create policy store_campaign_assets_owner_select
on public.store_campaign_assets
for select to authenticated
using (created_by=(select auth.uid()));

drop policy if exists store_campaign_assets_owner_insert on public.store_campaign_assets;
create policy store_campaign_assets_owner_insert
on public.store_campaign_assets
for insert to authenticated
with check (created_by=(select auth.uid()));

drop policy if exists store_campaign_assets_owner_update on public.store_campaign_assets;
create policy store_campaign_assets_owner_update
on public.store_campaign_assets
for update to authenticated
using (created_by=(select auth.uid()))
with check (created_by=(select auth.uid()));

drop policy if exists store_campaign_assets_owner_delete on public.store_campaign_assets;
create policy store_campaign_assets_owner_delete
on public.store_campaign_assets
for delete to authenticated
using (created_by=(select auth.uid()));

create index if not exists store_campaign_assets_product_phase_status_idx
  on public.store_campaign_assets(product_id,phase,status,sequence_order);

create index if not exists store_campaign_assets_created_by_idx
  on public.store_campaign_assets(created_by);
