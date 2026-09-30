create policy data_room_documents_delete_asset_owner
on public.data_room_documents
for delete
to authenticated
using (
  exists (
    select 1
    from public.assets a
    where a.id = data_room_documents.asset_id
      and a.created_by = (select auth.uid())
  )
);

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
      'ASSET_STATUS_CHANGED'
    )
  );

create or replace function private.log_data_room_access_revoked()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_asset_id uuid;
begin
  select d.asset_id into v_asset_id
  from public.data_room_documents d
  where d.id = old.document_id;

  insert into public.audit_events (
    event_type, actor_user_id, asset_id, document_id, details
  ) values (
    'ACCESS_REVOKED',
    auth.uid(),
    v_asset_id,
    old.document_id,
    jsonb_build_object('grantee_user_id', old.user_id)
  );

  return old;
end;
$$;

revoke execute on function private.log_data_room_access_revoked() from public, anon, authenticated;

drop trigger if exists data_room_access_audit_revoke on public.data_room_access;
create trigger data_room_access_audit_revoke
after delete on public.data_room_access
for each row execute function private.log_data_room_access_revoked();

create or replace function public.grant_data_room_access_v1(
  p_document_id uuid,
  p_email text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_grantee uuid;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.data_room_documents d
    join public.assets a on a.id = d.asset_id
    where d.id = p_document_id
      and a.created_by = v_actor
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select u.id into v_grantee
  from auth.users u
  where lower(u.email) = lower(btrim(p_email))
    and u.deleted_at is null
  limit 1;

  if v_grantee is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  insert into public.data_room_access(document_id,user_id,granted_by)
  values (p_document_id,v_grantee,v_actor)
  on conflict (document_id,user_id) do nothing;

  return v_grantee;
end;
$$;

revoke all on function public.grant_data_room_access_v1(uuid,text) from public, anon;
grant execute on function public.grant_data_room_access_v1(uuid,text) to authenticated;

create or replace function public.revoke_data_room_access_v1(
  p_document_id uuid,
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

  if not exists (
    select 1
    from public.data_room_documents d
    join public.assets a on a.id = d.asset_id
    where d.id = p_document_id
      and a.created_by = v_actor
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  delete from public.data_room_access
  where document_id = p_document_id
    and user_id = p_user_id;
end;
$$;

revoke all on function public.revoke_data_room_access_v1(uuid,uuid) from public, anon;
grant execute on function public.revoke_data_room_access_v1(uuid,uuid) to authenticated;

create or replace function public.get_data_room_access_v1(p_document_id uuid)
returns table(user_id uuid, email text, created_at timestamptz)
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

  if not exists (
    select 1
    from public.data_room_documents d
    join public.assets a on a.id = d.asset_id
    where d.id = p_document_id
      and a.created_by = v_actor
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  return query
  select dra.user_id, u.email::text, dra.created_at
  from public.data_room_access dra
  join auth.users u on u.id = dra.user_id
  where dra.document_id = p_document_id
  order by dra.created_at asc;
end;
$$;

revoke all on function public.get_data_room_access_v1(uuid) from public, anon;
grant execute on function public.get_data_room_access_v1(uuid) to authenticated;

create or replace function public.record_data_room_event_v1(
  p_document_id uuid,
  p_event_type text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_asset_id uuid;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_event_type not in ('FILE_UPLOADED','FILE_VIEWED','FILE_DOWNLOADED') then
    raise exception 'INVALID_EVENT_TYPE';
  end if;

  select d.asset_id into v_asset_id
  from public.data_room_documents d
  where d.id = p_document_id
    and (
      (p_event_type = 'FILE_UPLOADED' and exists (
        select 1 from public.assets a
        where a.id=d.asset_id and a.created_by=v_actor
      ))
      or
      (p_event_type in ('FILE_VIEWED','FILE_DOWNLOADED')
       and private.can_read_data_room_document(d.id))
    );

  if v_asset_id is null then
    raise exception 'NOT_AUTHORIZED';
  end if;

  insert into public.audit_events(
    event_type, actor_user_id, asset_id, document_id, details
  ) values (
    p_event_type, v_actor, v_asset_id, p_document_id, '{}'::jsonb
  );
end;
$$;

revoke all on function public.record_data_room_event_v1(uuid,text) from public, anon;
grant execute on function public.record_data_room_event_v1(uuid,text) to authenticated;
