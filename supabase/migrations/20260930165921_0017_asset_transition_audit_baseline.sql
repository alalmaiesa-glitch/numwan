alter table public.assets
  add column if not exists source_idea_id uuid
    references public.ideas(id) on delete restrict;

create index if not exists assets_source_idea_id_idx
  on public.assets(source_idea_id);

drop policy if exists assets_insert_own on public.assets;
create policy assets_insert_own
on public.assets
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (
    source_idea_id is null
    or exists (
      select 1
      from public.ideas i
      where i.id = assets.source_idea_id
        and i.created_by = (select auth.uid())
    )
  )
);

drop policy if exists assets_update_own on public.assets;
create policy assets_update_own
on public.assets
for update
to authenticated
using (created_by = (select auth.uid()))
with check (
  created_by = (select auth.uid())
  and (
    source_idea_id is null
    or exists (
      select 1
      from public.ideas i
      where i.id = assets.source_idea_id
        and i.created_by = (select auth.uid())
    )
  )
);

alter table public.audit_events
  drop constraint if exists audit_events_event_type_check;

alter table public.audit_events
  add constraint audit_events_event_type_check check (
    event_type in (
      'ACCESS_GRANTED',
      'DATA_ROOM_OPENED',
      'FILE_VIEWED',
      'FILE_DOWNLOADED',
      'ASSET_CREATED',
      'ASSET_STATUS_CHANGED'
    )
  );

create or replace function private.log_asset_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_events (
      event_type,
      actor_user_id,
      asset_id,
      details
    ) values (
      'ASSET_CREATED',
      coalesce(auth.uid(), new.created_by),
      new.id,
      jsonb_build_object(
        'source_idea_id', new.source_idea_id,
        'status', new.status
      )
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.audit_events (
      event_type,
      actor_user_id,
      asset_id,
      details
    ) values (
      'ASSET_STATUS_CHANGED',
      coalesce(auth.uid(), new.created_by),
      new.id,
      jsonb_build_object(
        'from_status', old.status,
        'to_status', new.status,
        'source_idea_id', new.source_idea_id
      )
    );
  end if;

  return new;
end;
$$;

revoke execute on function private.log_asset_audit() from public, anon, authenticated;

drop trigger if exists assets_audit_insert_or_status_change on public.assets;
create trigger assets_audit_insert_or_status_change
after insert or update of status on public.assets
for each row execute function private.log_asset_audit();
