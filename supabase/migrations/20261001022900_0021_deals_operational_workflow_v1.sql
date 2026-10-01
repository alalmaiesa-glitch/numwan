alter table public.audit_events
  drop constraint if exists audit_events_event_type_check;

alter table public.audit_events
  add constraint audit_events_event_type_check check (
    event_type in (
      'ACCESS_GRANTED',
      'ACCESS_REVOKED',
      'DATA_ROOM_OPENED',
      'FILE_VIEWED',
      'FILE_DOWNLOADED',
      'FILE_UPLOADED',
      'ASSET_CREATED',
      'ASSET_STATUS_CHANGED',
      'DEAL_CREATED',
      'DEAL_PARTICIPANT_ADDED',
      'DEAL_PARTICIPANT_REMOVED'
    )
  );

create or replace function private.log_deal_created_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_events(
    event_type,
    actor_user_id,
    asset_id,
    deal_id,
    details
  ) values (
    'DEAL_CREATED',
    coalesce(auth.uid(), new.created_by),
    new.asset_id,
    new.id,
    jsonb_build_object('status', new.status)
  );

  return new;
end;
$$;

revoke execute on function private.log_deal_created_v1() from public, anon, authenticated;

drop trigger if exists deals_audit_created_v1 on public.deals;
create trigger deals_audit_created_v1
after insert on public.deals
for each row execute function private.log_deal_created_v1();

create or replace function private.log_deal_participant_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deal_id uuid;
  v_user_id uuid;
  v_asset_id uuid;
  v_actor uuid;
begin
  if tg_op = 'INSERT' then
    v_deal_id := new.deal_id;
    v_user_id := new.user_id;
    v_actor := coalesce(auth.uid(), new.added_by);
  else
    v_deal_id := old.deal_id;
    v_user_id := old.user_id;
    v_actor := coalesce(auth.uid(), old.added_by);
  end if;

  select d.asset_id into v_asset_id
  from public.deals d
  where d.id = v_deal_id;

  insert into public.audit_events(
    event_type,
    actor_user_id,
    asset_id,
    deal_id,
    details
  ) values (
    case when tg_op='INSERT' then 'DEAL_PARTICIPANT_ADDED' else 'DEAL_PARTICIPANT_REMOVED' end,
    v_actor,
    v_asset_id,
    v_deal_id,
    jsonb_build_object('participant_user_id', v_user_id)
  );

  return case when tg_op='INSERT' then new else old end;
end;
$$;

revoke execute on function private.log_deal_participant_v1() from public, anon, authenticated;

drop trigger if exists deal_participants_audit_v1 on public.deal_participants;
create trigger deal_participants_audit_v1
after insert or delete on public.deal_participants
for each row execute function private.log_deal_participant_v1();

create or replace function public.create_deal_v1(p_asset_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_deal_id uuid;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.assets a
    where a.id = p_asset_id
      and a.created_by = v_actor
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  insert into public.deals(asset_id, created_by)
  values (p_asset_id, v_actor)
  returning id into v_deal_id;

  return v_deal_id;
end;
$$;

revoke all on function public.create_deal_v1(uuid) from public, anon;
grant execute on function public.create_deal_v1(uuid) to authenticated;

create or replace function public.add_deal_participant_v1(
  p_deal_id uuid,
  p_email text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_user_id uuid;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not private.is_deal_asset_owner(p_deal_id) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select u.id into v_user_id
  from auth.users u
  where lower(u.email) = lower(btrim(p_email))
    and u.deleted_at is null
  limit 1;

  if v_user_id is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  insert into public.deal_participants(deal_id, user_id, added_by)
  values (p_deal_id, v_user_id, v_actor)
  on conflict (deal_id, user_id) do nothing;

  return v_user_id;
end;
$$;

revoke all on function public.add_deal_participant_v1(uuid,text) from public, anon;
grant execute on function public.add_deal_participant_v1(uuid,text) to authenticated;

create or replace function public.remove_deal_participant_v1(
  p_deal_id uuid,
  p_user_id uuid
)
returns void
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

  if not private.is_deal_asset_owner(p_deal_id) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  delete from public.deal_participants
  where deal_id = p_deal_id
    and user_id = p_user_id;
end;
$$;

revoke all on function public.remove_deal_participant_v1(uuid,uuid) from public, anon;
grant execute on function public.remove_deal_participant_v1(uuid,uuid) to authenticated;

create or replace function public.get_deal_participants_v1(p_deal_id uuid)
returns table(user_id uuid, email text, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_is_owner boolean;
  v_is_participant boolean;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  v_is_owner := private.is_deal_asset_owner(p_deal_id);
  v_is_participant := private.is_deal_participant(p_deal_id);

  if not v_is_owner and not v_is_participant then
    raise exception 'NOT_AUTHORIZED';
  end if;

  return query
  select dp.user_id, u.email::text, dp.created_at
  from public.deal_participants dp
  join auth.users u on u.id = dp.user_id
  where dp.deal_id = p_deal_id
    and (v_is_owner or dp.user_id = v_actor)
  order by dp.created_at asc;
end;
$$;

revoke all on function public.get_deal_participants_v1(uuid) from public, anon;
grant execute on function public.get_deal_participants_v1(uuid) to authenticated;

create or replace function public.get_deal_context_v1(p_deal_id uuid)
returns table(
  deal_id uuid,
  deal_status text,
  deal_created_at timestamptz,
  deal_updated_at timestamptz,
  asset_id uuid,
  asset_code text,
  asset_title text,
  asset_summary text,
  disclosure_level text,
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
    d.updated_at,
    a.id,
    a.asset_code,
    a.title,
    a.summary,
    a.disclosure_level,
    (a.created_by = v_actor)
  from public.deals d
  join public.assets a on a.id = d.asset_id
  where d.id = p_deal_id
    and (
      a.created_by = v_actor
      or d.created_by = v_actor
      or exists (
        select 1
        from public.deal_participants dp
        where dp.deal_id = d.id
          and dp.user_id = v_actor
      )
    )
  limit 1;
end;
$$;

revoke all on function public.get_deal_context_v1(uuid) from public, anon;
grant execute on function public.get_deal_context_v1(uuid) to authenticated;
