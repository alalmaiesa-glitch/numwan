alter table private.numwan_product1_source_staging
  add column if not exists owners jsonb,
  add column if not exists confidence jsonb,
  add column if not exists detail_raw jsonb,
  add column if not exists enriched_at timestamptz;

create or replace function public.enrich_numwan_product1_sources_v1(
  p_year integer default 2025,
  p_batch_size integer default 10
)
returns integer
language plpgsql
security definer
set search_path=''
as $$
declare
  v_row record;
  v_status integer;
  v_content text;
  v_json jsonb;
  v_updated integer := 0;
  v_url text;
begin
  if p_batch_size < 1 or p_batch_size > 25 then
    raise exception 'INVALID_BATCH_SIZE';
  end if;

  for v_row in
    select source_id
    from private.numwan_product1_source_staging
    where data_year=p_year
      and detail_raw is null
    order by emissions_quantity desc nulls last,source_id
    limit p_batch_size
  loop
    v_url :=
      'https://api.climatetrace.org/v7/sources/' || v_row.source_id::text ||
      '?start=' || p_year::text ||
      '&end=' || p_year::text ||
      '&timeGranularity=year&gas=co2e_100yr';

    select h.status,h.content
      into v_status,v_content
    from extensions.http_get(v_url) h;

    if v_status <> 200 then
      raise exception 'CLIMATE_TRACE_DETAIL_HTTP_%_SOURCE_%',v_status,v_row.source_id;
    end if;

    v_json := v_content::jsonb;

    update private.numwan_product1_source_staging
    set
      owners=coalesce(v_json->'owners','[]'::jsonb),
      confidence=coalesce(v_json->'confidence','[]'::jsonb),
      detail_raw=v_json,
      enriched_at=now()
    where source_id=v_row.source_id;

    v_updated := v_updated + 1;
  end loop;

  return v_updated;
end;
$$;

revoke all on function public.enrich_numwan_product1_sources_v1(integer,integer)
from public,anon,authenticated;
grant execute on function public.enrich_numwan_product1_sources_v1(integer,integer)
to service_role;
