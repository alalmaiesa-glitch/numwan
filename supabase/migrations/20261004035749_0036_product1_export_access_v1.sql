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

  select exists (
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

revoke all on function public.get_numwan_product1_sources_v1(uuid)
from public,anon;
grant execute on function public.get_numwan_product1_sources_v1(uuid)
to authenticated;

create or replace function public.get_numwan_product1_sample_v1()
returns table (
  source_id bigint,
  facility_name text,
  subsector_en text,
  subsector_ar text,
  asset_type text,
  latitude numeric,
  longitude numeric,
  owner_names text,
  capacity numeric,
  capacity_units text,
  emissions_co2e_2025_t numeric,
  confidence_emissions text,
  source_license text
)
language plpgsql
security definer
set search_path=''
as $$
begin
  if not exists (
    select 1
    from public.store_products
    where slug='saudi-industrial-intelligence-v1'
      and status='PUBLISHED'
  ) then
    return;
  end if;

  return query
  with ranked as (
    select
      d.*,
      row_number() over (
        partition by d.subsector_code
        order by d.emissions_co2e_2025_t desc nulls last,d.facility_name
      ) as rn
    from private.numwan_product1_dataset_v1 d
  ),
  representative as (
    select * from ranked where rn=1
  ),
  extras as (
    select r.*
    from ranked r
    where not exists (
      select 1 from representative x where x.source_id=r.source_id
    )
    order by r.emissions_co2e_2025_t desc nulls last,r.facility_name
    limit 3
  ),
  chosen as (
    select * from representative
    union all
    select * from extras
  )
  select
    c.source_id,c.facility_name,c.subsector_en,c.subsector_ar,c.asset_type,
    c.latitude,c.longitude,c.owner_names,c.capacity,c.capacity_units,
    c.emissions_co2e_2025_t,c.confidence_emissions,c.source_license
  from chosen c
  order by c.emissions_co2e_2025_t desc nulls last,c.facility_name;
end;
$$;

revoke all on function public.get_numwan_product1_sample_v1()
from public;
grant execute on function public.get_numwan_product1_sample_v1()
to anon,authenticated;
