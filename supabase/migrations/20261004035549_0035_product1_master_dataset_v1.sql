create table if not exists private.numwan_product1_dataset_v1 (
  source_id bigint primary key,
  facility_name text not null,
  subsector_code text not null,
  subsector_en text not null,
  subsector_ar text not null,
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
  data_year integer not null,
  source_api_url text not null,
  source_name text not null default 'Climate TRACE',
  source_license text not null default 'CC BY 4.0',
  attribution_text text not null default 'Climate TRACE — CC BY 4.0',
  retrieved_at timestamptz not null
);

create index if not exists numwan_product1_dataset_subsector_idx
  on private.numwan_product1_dataset_v1(subsector_code);

create index if not exists numwan_product1_dataset_emissions_idx
  on private.numwan_product1_dataset_v1(emissions_co2e_2025_t desc);

create or replace function public.rebuild_numwan_product1_dataset_v1(p_year integer default 2025)
returns integer
language plpgsql
security definer
set search_path=''
as $$
declare
  v_count integer;
begin
  delete from private.numwan_product1_dataset_v1;

  insert into private.numwan_product1_dataset_v1 (
    source_id,facility_name,subsector_code,subsector_en,subsector_ar,
    asset_type,source_type,latitude,longitude,owner_names,owner_ids,
    capacity,capacity_units,activity_2025,activity_units,capacity_factor,
    emissions_co2e_2025_t,emissions_factor,emissions_factor_units,
    subsector_rank_2025,confidence_emissions,confidence_activity,
    confidence_capacity,data_year,source_api_url,retrieved_at
  )
  select
    s.source_id,
    btrim(s.source_name),
    s.subsector,
    case s.subsector
      when 'cement' then 'Cement'
      when 'petrochemical-steam-cracking' then 'Petrochemicals — Steam Cracking'
      when 'iron-and-steel' then 'Iron & Steel'
      when 'aluminum' then 'Aluminum'
      when 'chemicals' then 'Chemicals'
      when 'pulp-and-paper' then 'Pulp & Paper'
      when 'glass' then 'Glass'
      else initcap(replace(s.subsector,'-',' '))
    end,
    case s.subsector
      when 'cement' then 'الأسمنت'
      when 'petrochemical-steam-cracking' then 'البتروكيماويات'
      when 'iron-and-steel' then 'الحديد والصلب'
      when 'aluminum' then 'الألمنيوم'
      when 'chemicals' then 'الكيماويات'
      when 'pulp-and-paper' then 'الورق واللب'
      when 'glass' then 'الزجاج'
      else s.subsector
    end,
    nullif(btrim(s.asset_type),''),
    nullif(btrim(s.source_type),''),
    s.latitude,
    s.longitude,
    case when jsonb_typeof(s.owners)='array' then (
      select string_agg(distinct nullif(btrim(o->>'name'),''),'; ' order by nullif(btrim(o->>'name'),''))
      from jsonb_array_elements(s.owners) o
      where nullif(btrim(o->>'name'),'') is not null
    ) else null end,
    case when jsonb_typeof(s.owners)='array' then (
      select string_agg(distinct nullif(btrim(o->>'id'),''),'; ' order by nullif(btrim(o->>'id'),''))
      from jsonb_array_elements(s.owners) o
      where nullif(btrim(o->>'id'),'') is not null
    ) else null end,
    s.capacity,
    s.capacity_units,
    s.activity,
    s.activity_units,
    s.capacity_factor,
    s.emissions_quantity,
    s.emissions_factor,
    s.emissions_factor_units,
    nullif(s.detail_raw#>>'{subsectorRanks,0,rank}','')::integer,
    nullif(s.confidence#>>'{0,total_co2e_100yrgwp}',''),
    nullif(s.confidence#>>'{0,activity}',''),
    nullif(s.confidence#>>'{0,capacity}',''),
    s.data_year,
    'https://api.climatetrace.org/v7/sources/' || s.source_id::text,
    s.retrieved_at
  from private.numwan_product1_source_staging s
  where s.data_year=p_year
    and s.country='SAU'
    and s.sector='manufacturing'
    and s.subsector in (
      'cement',
      'petrochemical-steam-cracking',
      'iron-and-steel',
      'aluminum',
      'chemicals',
      'pulp-and-paper',
      'glass'
    )
    and s.detail_raw is not null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.rebuild_numwan_product1_dataset_v1(integer)
from public,anon,authenticated;
grant execute on function public.rebuild_numwan_product1_dataset_v1(integer)
to service_role;

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

revoke all on function public.get_numwan_product1_dataset_v1(uuid)
from public,anon;
grant execute on function public.get_numwan_product1_dataset_v1(uuid)
to authenticated;
