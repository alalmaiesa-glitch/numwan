create or replace function public.list_deals_v1()
returns table(
  deal_id uuid,
  status text,
  created_at timestamptz,
  asset_id uuid,
  asset_code text,
  asset_title text,
  is_owner boolean
)
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
  select
    d.id,
    d.status,
    d.created_at,
    a.id,
    a.asset_code,
    a.title,
    (a.created_by = v_actor)
  from public.deals d
  join public.assets a on a.id = d.asset_id
  where
    a.created_by = v_actor
    or d.created_by = v_actor
    or exists (
      select 1
      from public.deal_participants dp
      where dp.deal_id = d.id
        and dp.user_id = v_actor
    )
  order by d.created_at desc;
end;
$$;

revoke all on function public.list_deals_v1() from public, anon;
grant execute on function public.list_deals_v1() to authenticated;
