create table public.store_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  name_ar text not null,
  name_en text,
  publisher text not null,
  source_url text not null,
  source_type text not null,
  license_name text,
  license_url text,
  rights_status text not null default 'PENDING',
  commercial_use_allowed boolean not null default false,
  redistribution_allowed boolean not null default false,
  attribution_required boolean not null default false,
  attribution_text text,
  reviewed_at timestamptz,
  review_notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_sources_type_check check (
    source_type in ('OPEN_DATA','FIRST_PARTY','THIRD_PARTY','INTERNAL','REFERENCE')
  ),
  constraint store_sources_rights_check check (
    rights_status in ('PENDING','ALLOWED','RESTRICTED','BLOCKED')
  )
);

alter table public.store_sources enable row level security;
grant select,insert,update,delete on table public.store_sources to authenticated;
grant select,insert,update,delete on table public.store_sources to service_role;

create policy store_sources_owner_select on public.store_sources
for select to authenticated
using (created_by=(select auth.uid()));

create policy store_sources_owner_insert on public.store_sources
for insert to authenticated
with check (created_by=(select auth.uid()));

create policy store_sources_owner_update on public.store_sources
for update to authenticated
using (created_by=(select auth.uid()))
with check (created_by=(select auth.uid()));

create policy store_sources_owner_delete on public.store_sources
for delete to authenticated
using (created_by=(select auth.uid()));

create index store_sources_created_by_idx on public.store_sources(created_by);
create index store_sources_rights_idx on public.store_sources(rights_status);

create table public.store_product_sources (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products(id) on delete cascade,
  source_id uuid not null references public.store_sources(id) on delete restrict,
  usage_mode text not null,
  fields_used text[],
  notes text,
  created_at timestamptz not null default now(),
  unique(product_id,source_id),
  constraint store_product_sources_usage_check check (
    usage_mode in ('INCLUDED','DISCOVERY_ONLY','VALIDATION_ONLY','REFERENCE_ONLY')
  )
);

alter table public.store_product_sources enable row level security;
grant select,insert,update,delete on table public.store_product_sources to authenticated;
grant select,insert,update,delete on table public.store_product_sources to service_role;

create policy store_product_sources_owner_select on public.store_product_sources
for select to authenticated
using (
  exists (
    select 1 from public.store_products p
    where p.id=store_product_sources.product_id
      and p.created_by=(select auth.uid())
  )
);

create policy store_product_sources_owner_insert on public.store_product_sources
for insert to authenticated
with check (
  exists (
    select 1 from public.store_products p
    where p.id=store_product_sources.product_id
      and p.created_by=(select auth.uid())
  )
  and exists (
    select 1 from public.store_sources s
    where s.id=store_product_sources.source_id
      and s.created_by=(select auth.uid())
  )
);

create policy store_product_sources_owner_update on public.store_product_sources
for update to authenticated
using (
  exists (
    select 1 from public.store_products p
    where p.id=store_product_sources.product_id
      and p.created_by=(select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.store_products p
    where p.id=store_product_sources.product_id
      and p.created_by=(select auth.uid())
  )
);

create policy store_product_sources_owner_delete on public.store_product_sources
for delete to authenticated
using (
  exists (
    select 1 from public.store_products p
    where p.id=store_product_sources.product_id
      and p.created_by=(select auth.uid())
  )
);

create index store_product_sources_product_idx on public.store_product_sources(product_id);
create index store_product_sources_source_idx on public.store_product_sources(source_id);

create or replace function public.recalculate_store_product_rights_v1(p_product_id uuid)
returns text
language plpgsql
security definer
set search_path=''
as $$
declare
  v_included integer;
  v_blocked integer;
  v_pending integer;
  v_status text;
begin
  select
    count(*) filter (where ps.usage_mode='INCLUDED'),
    count(*) filter (
      where ps.usage_mode='INCLUDED'
        and (
          s.rights_status in ('RESTRICTED','BLOCKED')
          or s.commercial_use_allowed is not true
          or s.redistribution_allowed is not true
        )
    ),
    count(*) filter (
      where ps.usage_mode='INCLUDED'
        and s.rights_status <> 'ALLOWED'
    )
  into v_included,v_blocked,v_pending
  from public.store_product_sources ps
  join public.store_sources s on s.id=ps.source_id
  where ps.product_id=p_product_id;

  if coalesce(v_included,0)=0 then
    v_status:='REVIEW';
  elsif coalesce(v_blocked,0)>0 then
    v_status:='BLOCKED';
  elsif coalesce(v_pending,0)>0 then
    v_status:='REVIEW';
  else
    v_status:='CLEARED';
  end if;

  update public.store_products
  set
    rights_status=v_status,
    rights_reviewed_at=case when v_status in ('CLEARED','BLOCKED') then now() else null end,
    updated_at=now()
  where id=p_product_id;

  if not found then
    raise exception 'PRODUCT_NOT_FOUND';
  end if;

  return v_status;
end;
$$;

revoke all on function public.recalculate_store_product_rights_v1(uuid) from public,anon,authenticated;
grant execute on function public.recalculate_store_product_rights_v1(uuid) to service_role;
