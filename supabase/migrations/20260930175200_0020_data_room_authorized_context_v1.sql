create or replace function public.get_data_room_context_v1(p_asset_id uuid)
returns table(asset_id uuid, asset_code text, title text, disclosure_level text, is_owner boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  return query
  select a.id, a.asset_code, a.title, a.disclosure_level, (a.created_by = v_actor) as is_owner
  from public.assets a
  where a.id = p_asset_id
    and (
      a.created_by = v_actor
      or exists (
        select 1
        from public.data_room_documents d
        join public.data_room_access dra on dra.document_id = d.id
        where d.asset_id = a.id
          and dra.user_id = v_actor
      )
    )
  limit 1;
end;
$$;

revoke all on function public.get_data_room_context_v1(uuid) from public, anon;
grant execute on function public.get_data_room_context_v1(uuid) to authenticated;
