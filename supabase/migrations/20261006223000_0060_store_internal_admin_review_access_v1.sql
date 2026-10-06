-- Internal store review access.
-- Keeps storefront products private while the owner reviews delivery files.

update public.store_products
set
  status='DRAFT',
  checkout_status='NOT_READY',
  is_featured=false,
  checkout_notes='Public storefront disabled by owner pending internal product review.',
  updated_at=now()
where status<>'ARCHIVED';

insert into public.user_roles (user_id, role)
select id, 'ADMIN'
from auth.users
where lower(email) in ('alalmaiesa@gmail.com','info@numwan.net')
on conflict (user_id, role) do nothing;

create or replace function public.is_numwan_admin()
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id=auth.uid()
      and ur.role in ('ADMIN','OWNER')
  );
$$;

revoke all on function public.is_numwan_admin() from public,anon;
grant execute on function public.is_numwan_admin() to authenticated;

drop policy if exists store_products_admin_read on public.store_products;
create policy store_products_admin_read
on public.store_products
for select
to authenticated
using (public.is_numwan_admin());

drop policy if exists store_product_files_admin_read on public.store_product_files;
create policy store_product_files_admin_read
on public.store_product_files
for select
to authenticated
using (public.is_numwan_admin());

drop policy if exists store_product_objects_admin_select on storage.objects;
create policy store_product_objects_admin_select
on storage.objects
for select
to authenticated
using (
  bucket_id='numwan-store-products'
  and public.is_numwan_admin()
);

create or replace function public.get_numwan_product1_dataset_v1(p_product_id uuid)
returns table (
  source_id bigint,
  facility_name text,
  subsector_code text,
  subsector_en text,
  subsector_ar text,
  asset_type text,
  source_type text,
  latitude numeric,
  longitude numeric,
  owner_names text,
  owner_ids text,
  capacity numeric,
  capacity_units text,
  activity_2025 numeric,
  activity_units text,
  capacity_factor numeric,
  emissions_co2e_2025_t numeric,
  emissions_factor numeric,
  emissions_factor_units text,
  subsector_rank_2025 integer,
  confidence_emissions text,
  confidence_activity text,
  confidence_capacity text,
  data_year integer,
  source_api_url text,
  source_name text,
  source_license text,
  attribution_text text,
  retrieved_at timestamptz
)
language plpgsql
security definer
set search_path=''
as $$
declare
  v_user uuid := auth.uid();
  v_allowed boolean := false;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select public.is_numwan_admin() or exists (
    select 1
    from public.store_products p
    where p.id=p_product_id
      and (
        p.created_by=v_user
        or exists (
          select 1
          from public.store_entitlements e
          where e.product_id=p.id
            and e.user_id=v_user
            and e.status='ACTIVE'
            and (e.expires_at is null or e.expires_at>now())
        )
      )
  )
  into v_allowed;

  if not v_allowed then
    raise exception 'PRODUCT_ACCESS_DENIED';
  end if;

  return query
  select
    d.source_id,d.facility_name,d.subsector_code,d.subsector_en,d.subsector_ar,
    d.asset_type,d.source_type,d.latitude,d.longitude,d.owner_names,d.owner_ids,
    d.capacity,d.capacity_units,d.activity_2025,d.activity_units,d.capacity_factor,
    d.emissions_co2e_2025_t,d.emissions_factor,d.emissions_factor_units,
    d.subsector_rank_2025,d.confidence_emissions,d.confidence_activity,
    d.confidence_capacity,d.data_year,d.source_api_url,d.source_name,
    d.source_license,d.attribution_text,d.retrieved_at
  from private.numwan_product1_dataset_v1 d
  order by d.emissions_co2e_2025_t desc nulls last,d.facility_name;
end;
$$;

revoke all on function public.get_numwan_product1_dataset_v1(uuid) from public,anon;
grant execute on function public.get_numwan_product1_dataset_v1(uuid) to authenticated;

create or replace function public.get_numwan_product1_sources_v1(p_product_id uuid)
returns table (
  source_key text,
  name_ar text,
  name_en text,
  publisher text,
  source_url text,
  source_type text,
  license_name text,
  license_url text,
  rights_status text,
  commercial_use_allowed boolean,
  redistribution_allowed boolean,
  attribution_required boolean,
  attribution_text text,
  usage_mode text,
  fields_used text[],
  review_notes text,
  reviewed_at timestamptz
)
language plpgsql
security definer
set search_path=''
as $$
declare
  v_user uuid := auth.uid();
  v_allowed boolean := false;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select public.is_numwan_admin() or exists (
    select 1
    from public.store_products p
    where p.id=p_product_id
      and (
        p.created_by=v_user
        or exists (
          select 1
          from public.store_entitlements e
          where e.product_id=p.id
            and e.user_id=v_user
            and e.status='ACTIVE'
            and (e.expires_at is null or e.expires_at>now())
        )
      )
  )
  into v_allowed;

  if not v_allowed then
    raise exception 'PRODUCT_ACCESS_DENIED';
  end if;

  return query
  select
    s.source_key,s.name_ar,s.name_en,s.publisher,s.source_url,s.source_type,
    s.license_name,s.license_url,s.rights_status,s.commercial_use_allowed,
    s.redistribution_allowed,s.attribution_required,s.attribution_text,
    ps.usage_mode,ps.fields_used,s.review_notes,s.reviewed_at
  from public.store_product_sources ps
  join public.store_sources s on s.id=ps.source_id
  where ps.product_id=p_product_id
  order by
    case ps.usage_mode
      when 'INCLUDED' then 1
      when 'REFERENCE_ONLY' then 2
      when 'VALIDATION_ONLY' then 3
      else 4
    end,
    s.publisher,s.source_key;
end;
$$;

revoke all on function public.get_numwan_product1_sources_v1(uuid) from public,anon;
grant execute on function public.get_numwan_product1_sources_v1(uuid) to authenticated;
