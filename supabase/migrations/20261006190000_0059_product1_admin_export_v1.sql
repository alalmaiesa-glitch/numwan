create or replace function public.get_numwan_product1_admin_export_v1()
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
language sql
security definer
set search_path=''
as $$
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
$$;

revoke all on function public.get_numwan_product1_admin_export_v1()
from public,anon,authenticated;
grant execute on function public.get_numwan_product1_admin_export_v1()
to service_role;
