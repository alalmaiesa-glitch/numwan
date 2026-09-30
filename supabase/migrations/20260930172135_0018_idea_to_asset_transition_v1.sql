create unique index if not exists assets_source_idea_id_unique_idx
  on public.assets(source_idea_id)
  where source_idea_id is not null;

create or replace function public.convert_idea_to_asset_v1(p_idea_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_title text;
  v_summary text;
  v_disclosure_level text;
  v_asset_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select i.title, i.short_description, i.confidentiality_level
    into v_title, v_summary, v_disclosure_level
  from public.ideas i
  where i.id = p_idea_id
    and i.created_by = v_user_id
  for update;

  if not found then
    raise exception 'IDEA_NOT_FOUND_OR_NOT_OWNED';
  end if;

  select a.id
    into v_asset_id
  from public.assets a
  where a.source_idea_id = p_idea_id
  limit 1;

  if v_asset_id is not null then
    return v_asset_id;
  end if;

  insert into public.assets (
    title,
    summary,
    status,
    created_by,
    disclosure_level,
    source_idea_id
  ) values (
    v_title,
    v_summary,
    'DEVELOPMENT',
    v_user_id,
    v_disclosure_level,
    p_idea_id
  )
  returning id into v_asset_id;

  return v_asset_id;
end;
$$;

revoke all on function public.convert_idea_to_asset_v1(uuid) from public;
revoke all on function public.convert_idea_to_asset_v1(uuid) from anon;
grant execute on function public.convert_idea_to_asset_v1(uuid) to authenticated;
