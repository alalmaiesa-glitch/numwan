create schema if not exists private;

create table if not exists private.numwan_product1_source_staging (
  source_id bigint primary key,
  source_name text not null,
  sector text not null,
  subsector text not null,
  country text not null,
  asset_type text,
  source_type text,
  longitude numeric,
  latitude numeric,
  gas text,
  emissions_quantity numeric,
  emissions_factor numeric,
  emissions_factor_units text,
  activity numeric,
  activity_units text,
  capacity numeric,
  capacity_units text,
  capacity_factor numeric,
  data_year integer not null,
  raw jsonb not null,
  retrieved_at timestamptz not null default now()
);

create index if not exists numwan_product1_staging_subsector_idx
  on private.numwan_product1_source_staging(subsector);

create index if not exists numwan_product1_staging_emissions_idx
  on private.numwan_product1_source_staging(emissions_quantity desc);

create or replace function public.refresh_numwan_product1_sources_v1(p_year integer default 2025)
returns integer
language plpgsql
security definer
set search_path=''
as $$
declare
  v_offset integer := 0;
  v_limit integer := 100;
  v_pages integer := 0;
  v_total integer := 0;
  v_status integer;
  v_content text;
  v_json jsonb;
  v_count integer;
  v_item jsonb;
  v_url text;
begin
  if p_year < 2021 or p_year > extract(year from now())::integer then
    raise exception 'INVALID_DATA_YEAR';
  end if;

  delete from private.numwan_product1_source_staging
  where data_year=p_year;

  loop
    v_pages := v_pages + 1;
    if v_pages > 100 then
      raise exception 'SOURCE_PAGINATION_LIMIT_EXCEEDED';
    end if;

    v_url :=
      'https://api.climatetrace.org/v7/sources?year=' || p_year::text ||
      '&gas=co2e_100yr&sectors=manufacturing&gadmId=SAU&limit=' ||
      v_limit::text || '&offset=' || v_offset::text;

    select h.status,h.content
      into v_status,v_content
    from extensions.http_get(v_url) h;

    if v_status <> 200 then
      raise exception 'CLIMATE_TRACE_HTTP_%',v_status;
    end if;

    v_json := v_content::jsonb;

    if jsonb_typeof(v_json) <> 'array' then
      raise exception 'CLIMATE_TRACE_RESPONSE_NOT_ARRAY';
    end if;

    v_count := jsonb_array_length(v_json);

    for v_item in
      select value from jsonb_array_elements(v_json)
    loop
      insert into private.numwan_product1_source_staging (
        source_id,source_name,sector,subsector,country,
        asset_type,source_type,longitude,latitude,gas,
        emissions_quantity,emissions_factor,emissions_factor_units,
        activity,activity_units,capacity,capacity_units,capacity_factor,
        data_year,raw,retrieved_at
      ) values (
        (v_item->>'id')::bigint,
        v_item->>'name',
        v_item->>'sector',
        v_item->>'subsector',
        v_item->>'country',
        v_item->>'assetType',
        v_item->>'sourceType',
        nullif(v_item#>>'{centroid,longitude}','')::numeric,
        nullif(v_item#>>'{centroid,latitude}','')::numeric,
        v_item->>'gas',
        nullif(v_item->>'emissionsQuantity','')::numeric,
        nullif(v_item->>'emissionsFactor','')::numeric,
        v_item->>'emissionsFactorUnits',
        nullif(v_item->>'activity','')::numeric,
        v_item->>'activityUnits',
        nullif(v_item->>'capacity','')::numeric,
        v_item->>'capacityUnits',
        nullif(v_item->>'capacityFactor','')::numeric,
        p_year,
        v_item,
        now()
      )
      on conflict (source_id) do update set
        source_name=excluded.source_name,
        sector=excluded.sector,
        subsector=excluded.subsector,
        country=excluded.country,
        asset_type=excluded.asset_type,
        source_type=excluded.source_type,
        longitude=excluded.longitude,
        latitude=excluded.latitude,
        gas=excluded.gas,
        emissions_quantity=excluded.emissions_quantity,
        emissions_factor=excluded.emissions_factor,
        emissions_factor_units=excluded.emissions_factor_units,
        activity=excluded.activity,
        activity_units=excluded.activity_units,
        capacity=excluded.capacity,
        capacity_units=excluded.capacity_units,
        capacity_factor=excluded.capacity_factor,
        data_year=excluded.data_year,
        raw=excluded.raw,
        retrieved_at=excluded.retrieved_at;
    end loop;

    v_total := v_total + v_count;

    exit when v_count < v_limit;

    v_offset := v_offset + v_limit;
  end loop;

  return v_total;
end;
$$;

revoke all on function public.refresh_numwan_product1_sources_v1(integer)
from public,anon,authenticated;
grant execute on function public.refresh_numwan_product1_sources_v1(integer)
to service_role;
