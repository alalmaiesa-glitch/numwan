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
    regexp_replace(btrim(s.source_name),'[[:space:],;]+$','','g'),
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

select public.rebuild_numwan_product1_dataset_v1(2025);
