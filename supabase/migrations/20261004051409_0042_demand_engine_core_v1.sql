create table if not exists public.store_public_snapshots (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  product_id uuid not null references public.store_products(id) on delete cascade,
  title_ar text not null,
  title_en text not null,
  summary_ar text not null,
  summary_en text not null,
  data_year integer not null,
  metrics jsonb not null default '{}'::jsonb,
  breakdown jsonb not null default '[]'::jsonb,
  methodology_ar text,
  methodology_en text,
  is_public boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_public_snapshots enable row level security;
grant select on table public.store_public_snapshots to anon, authenticated;
grant select,insert,update,delete on table public.store_public_snapshots to service_role;

drop policy if exists store_public_snapshots_public_read on public.store_public_snapshots;
create policy store_public_snapshots_public_read
on public.store_public_snapshots
for select
to anon,authenticated
using (is_public=true);

create index if not exists store_public_snapshots_product_idx
  on public.store_public_snapshots(product_id);

create table if not exists public.store_leads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products(id) on delete cascade,
  email text not null,
  language text not null default 'ar',
  status text not null default 'SUBSCRIBED',
  consent boolean not null default false,
  consent_version text not null default 'launch-updates-v1',
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_leads_language_check check (language in ('ar','en')),
  constraint store_leads_status_check check (status in ('SUBSCRIBED','UNSUBSCRIBED','BOUNCED')),
  constraint store_leads_consent_required check (consent=true),
  constraint store_leads_email_basic_check check (
    email=lower(btrim(email))
    and position('@' in email)>1
    and length(email) between 5 and 254
  )
);

alter table public.store_leads enable row level security;
grant select on table public.store_leads to authenticated;
grant select,insert,update,delete on table public.store_leads to service_role;

drop policy if exists store_leads_merchant_read on public.store_leads;
create policy store_leads_merchant_read
on public.store_leads
for select
to authenticated
using (
  exists (
    select 1 from public.store_products p
    where p.id=store_leads.product_id
      and p.created_by=(select auth.uid())
  )
);

create unique index if not exists store_leads_product_email_unique_idx
  on public.store_leads(product_id,lower(email));

create index if not exists store_leads_product_status_time_idx
  on public.store_leads(product_id,status,subscribed_at desc);

create table if not exists public.store_target_accounts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products(id) on delete cascade,
  company_name text not null,
  domain text,
  country text,
  segment text not null,
  rationale text not null,
  source_url text,
  public_contact_url text,
  language text not null default 'en',
  status text not null default 'NEW',
  priority smallint not null default 3,
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_target_accounts_language_check check (language in ('ar','en')),
  constraint store_target_accounts_status_check check (
    status in ('NEW','RESEARCHED','QUALIFIED','CONTACT_READY','CONTACTED','ENGAGED','DISQUALIFIED')
  ),
  constraint store_target_accounts_priority_check check (priority between 1 and 5)
);

alter table public.store_target_accounts enable row level security;
grant select,insert,update,delete on table public.store_target_accounts to authenticated;
grant select,insert,update,delete on table public.store_target_accounts to service_role;

drop policy if exists store_target_accounts_owner_select on public.store_target_accounts;
create policy store_target_accounts_owner_select
on public.store_target_accounts
for select to authenticated
using (created_by=(select auth.uid()));

drop policy if exists store_target_accounts_owner_insert on public.store_target_accounts;
create policy store_target_accounts_owner_insert
on public.store_target_accounts
for insert to authenticated
with check (created_by=(select auth.uid()));

drop policy if exists store_target_accounts_owner_update on public.store_target_accounts;
create policy store_target_accounts_owner_update
on public.store_target_accounts
for update to authenticated
using (created_by=(select auth.uid()))
with check (created_by=(select auth.uid()));

drop policy if exists store_target_accounts_owner_delete on public.store_target_accounts;
create policy store_target_accounts_owner_delete
on public.store_target_accounts
for delete to authenticated
using (created_by=(select auth.uid()));

create index if not exists store_target_accounts_product_status_priority_idx
  on public.store_target_accounts(product_id,status,priority,created_at desc);

create unique index if not exists store_target_accounts_product_domain_unique_idx
  on public.store_target_accounts(product_id,lower(domain))
  where domain is not null;
