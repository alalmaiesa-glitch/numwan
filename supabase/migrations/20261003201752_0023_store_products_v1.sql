create table public.store_products (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references public.assets(id) on delete set null,
  slug text not null unique,
  sku text unique,
  title_ar text not null,
  title_en text,
  summary_ar text not null,
  summary_en text,
  product_type text not null,
  status text not null default 'DRAFT',
  price_sar numeric(12,2) not null,
  compare_at_price_sar numeric(12,2),
  delivery_mode text not null default 'DOWNLOAD',
  license_tier text not null default 'STANDARD',
  is_featured boolean not null default false,
  preview_ar text,
  preview_en text,
  created_by uuid not null references auth.users(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint store_products_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint store_products_title_ar_not_blank check (
    length(btrim(title_ar)) > 0
  ),
  constraint store_products_summary_ar_not_blank check (
    length(btrim(summary_ar)) > 0
  ),
  constraint store_products_type_check check (
    product_type in ('DATASET','REPORT','FINANCIAL_MODEL','BLUEPRINT','BUNDLE','TOOLKIT')
  ),
  constraint store_products_status_check check (
    status in ('DRAFT','PUBLISHED','ARCHIVED')
  ),
  constraint store_products_price_nonnegative check (
    price_sar >= 0
  ),
  constraint store_products_compare_price_valid check (
    compare_at_price_sar is null or compare_at_price_sar >= price_sar
  ),
  constraint store_products_delivery_mode_check check (
    delivery_mode in ('DOWNLOAD','LICENSED_DOWNLOAD','DIGITAL_ACCESS')
  ),
  constraint store_products_license_tier_check check (
    license_tier in ('STANDARD','PROFESSIONAL','COMMERCIAL')
  ),
  constraint store_products_publish_date_check check (
    (status <> 'PUBLISHED') or (published_at is not null)
  )
);

alter table public.store_products enable row level security;

grant select on table public.store_products to anon, authenticated;
grant insert, update, delete on table public.store_products to authenticated;
grant select, insert, update, delete on table public.store_products to service_role;

create policy store_products_public_read
on public.store_products
for select
to anon
using (status = 'PUBLISHED');

create policy store_products_authenticated_read
on public.store_products
for select
to authenticated
using (
  status = 'PUBLISHED'
  or created_by = (select auth.uid())
);

create policy store_products_owner_insert
on public.store_products
for insert
to authenticated
with check (
  created_by = (select auth.uid())
);

create policy store_products_owner_update
on public.store_products
for update
to authenticated
using (
  created_by = (select auth.uid())
)
with check (
  created_by = (select auth.uid())
);

create policy store_products_owner_delete
on public.store_products
for delete
to authenticated
using (
  created_by = (select auth.uid())
);

create index store_products_status_published_idx
  on public.store_products(status, published_at desc);

create index store_products_featured_idx
  on public.store_products(is_featured, published_at desc)
  where status = 'PUBLISHED';
