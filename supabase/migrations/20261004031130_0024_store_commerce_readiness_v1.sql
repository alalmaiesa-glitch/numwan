alter table public.store_products
  add column rights_status text not null default 'PENDING',
  add column rights_basis text,
  add column rights_notes text,
  add column rights_reviewed_at timestamptz,
  add column delivery_status text not null default 'NOT_READY',
  add column delivery_notes text,
  add column delivery_ready_at timestamptz,
  add column checkout_status text not null default 'NOT_READY',
  add column checkout_notes text,
  add column checkout_ready_at timestamptz,
  add column source_attribution text,
  add column product_version text not null default '1.0';

alter table public.store_products
  add constraint store_products_rights_status_check
  check (rights_status in ('PENDING','REVIEW','CLEARED','BLOCKED')),
  add constraint store_products_delivery_status_check
  check (delivery_status in ('NOT_READY','PREPARING','READY','BLOCKED')),
  add constraint store_products_checkout_status_check
  check (checkout_status in ('NOT_READY','CONFIGURING','READY','BLOCKED')),
  add constraint store_products_publication_gate_check
  check (
    status <> 'PUBLISHED'
    or (
      rights_status = 'CLEARED'
      and delivery_status = 'READY'
      and checkout_status = 'READY'
      and published_at is not null
    )
  );

create table public.store_product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products(id) on delete cascade,
  file_label text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  file_version text not null default '1.0',
  is_active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.store_product_files enable row level security;
grant select, insert, update, delete on table public.store_product_files to authenticated;
grant select, insert, update, delete on table public.store_product_files to service_role;

create policy store_product_files_owner_select
on public.store_product_files
for select
to authenticated
using (
  exists (
    select 1
    from public.store_products p
    where p.id = store_product_files.product_id
      and p.created_by = (select auth.uid())
  )
);

create policy store_product_files_owner_insert
on public.store_product_files
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.store_products p
    where p.id = store_product_files.product_id
      and p.created_by = (select auth.uid())
  )
);

create policy store_product_files_owner_update
on public.store_product_files
for update
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.store_products p
    where p.id = store_product_files.product_id
      and p.created_by = (select auth.uid())
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.store_products p
    where p.id = store_product_files.product_id
      and p.created_by = (select auth.uid())
  )
);

create policy store_product_files_owner_delete
on public.store_product_files
for delete
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.store_products p
    where p.id = store_product_files.product_id
      and p.created_by = (select auth.uid())
  )
);

create table public.store_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique default (
    'NW-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))
  ),
  merchant_user_id uuid not null references auth.users(id),
  buyer_user_id uuid references auth.users(id),
  buyer_email text not null,
  status text not null default 'PENDING',
  currency text not null default 'SAR',
  subtotal_sar numeric(12,2) not null default 0,
  total_sar numeric(12,2) not null default 0,
  payment_provider text,
  provider_checkout_id text,
  provider_payment_id text,
  provider_reference text,
  paid_at timestamptz,
  refunded_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_orders_status_check check (
    status in ('PENDING','AWAITING_PAYMENT','PAID','FAILED','REFUNDED','CANCELED')
  ),
  constraint store_orders_currency_check check (currency = 'SAR'),
  constraint store_orders_subtotal_nonnegative check (subtotal_sar >= 0),
  constraint store_orders_total_nonnegative check (total_sar >= 0),
  constraint store_orders_paid_timestamp_check check (
    status <> 'PAID' or paid_at is not null
  )
);

alter table public.store_orders enable row level security;
grant select on table public.store_orders to authenticated;
grant select, insert, update, delete on table public.store_orders to service_role;

create policy store_orders_buyer_or_merchant_read
on public.store_orders
for select
to authenticated
using (
  buyer_user_id = (select auth.uid())
  or merchant_user_id = (select auth.uid())
);

create index store_orders_merchant_status_created_idx
  on public.store_orders(merchant_user_id,status,created_at desc);
create index store_orders_buyer_created_idx
  on public.store_orders(buyer_user_id,created_at desc)
  where buyer_user_id is not null;
create unique index store_orders_provider_payment_unique_idx
  on public.store_orders(payment_provider,provider_payment_id)
  where provider_payment_id is not null;

create table public.store_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.store_orders(id) on delete cascade,
  product_id uuid not null references public.store_products(id) on delete restrict,
  title_snapshot text not null,
  license_tier text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_sar numeric(12,2) not null check (unit_price_sar >= 0),
  line_total_sar numeric(12,2) not null check (line_total_sar >= 0),
  created_at timestamptz not null default now(),
  constraint store_order_items_license_check check (
    license_tier in ('STANDARD','PROFESSIONAL','COMMERCIAL')
  )
);

alter table public.store_order_items enable row level security;
grant select on table public.store_order_items to authenticated;
grant select, insert, update, delete on table public.store_order_items to service_role;

create policy store_order_items_authorized_read
on public.store_order_items
for select
to authenticated
using (
  exists (
    select 1 from public.store_orders o
    where o.id = store_order_items.order_id
      and (
        o.buyer_user_id = (select auth.uid())
        or o.merchant_user_id = (select auth.uid())
      )
  )
);

create index store_order_items_order_idx on public.store_order_items(order_id);
create index store_order_items_product_idx on public.store_order_items(product_id);

create table public.store_entitlements (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.store_orders(id) on delete cascade,
  order_item_id uuid not null references public.store_order_items(id) on delete cascade,
  product_id uuid not null references public.store_products(id) on delete restrict,
  user_id uuid references auth.users(id),
  buyer_email text not null,
  status text not null default 'ACTIVE',
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint store_entitlements_status_check check (
    status in ('ACTIVE','REVOKED','EXPIRED')
  )
);

alter table public.store_entitlements enable row level security;
grant select on table public.store_entitlements to authenticated;
grant select, insert, update, delete on table public.store_entitlements to service_role;

create policy store_entitlements_buyer_or_merchant_read
on public.store_entitlements
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.store_products p
    where p.id = store_entitlements.product_id
      and p.created_by = (select auth.uid())
  )
);

create unique index store_entitlements_order_item_unique_idx
  on public.store_entitlements(order_item_id);
create index store_entitlements_user_product_idx
  on public.store_entitlements(user_id,product_id)
  where user_id is not null;

create table public.store_download_events (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid not null references public.store_entitlements(id) on delete cascade,
  product_file_id uuid not null references public.store_product_files(id) on delete restrict,
  user_id uuid references auth.users(id),
  downloaded_at timestamptz not null default now()
);

alter table public.store_download_events enable row level security;
grant select on table public.store_download_events to authenticated;
grant select, insert on table public.store_download_events to service_role;

create policy store_download_events_buyer_or_merchant_read
on public.store_download_events
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.store_entitlements e
    join public.store_products p on p.id = e.product_id
    where e.id = store_download_events.entitlement_id
      and p.created_by = (select auth.uid())
  )
);

create index store_download_events_entitlement_time_idx
  on public.store_download_events(entitlement_id,downloaded_at desc);
