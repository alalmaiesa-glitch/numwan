create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in (
      'ACCESS_GRANTED',
      'DATA_ROOM_OPENED',
      'FILE_VIEWED',
      'FILE_DOWNLOADED'
    )
  ),
  actor_user_id uuid references auth.users(id),
  asset_id uuid references public.assets(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  document_id uuid references public.data_room_documents(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index audit_events_actor_user_id_idx on public.audit_events(actor_user_id);
create index audit_events_asset_id_idx on public.audit_events(asset_id);
create index audit_events_deal_id_idx on public.audit_events(deal_id);
create index audit_events_document_id_idx on public.audit_events(document_id);
create index audit_events_occurred_at_idx on public.audit_events(occurred_at desc);

alter table public.audit_events enable row level security;

create or replace function private.log_data_room_access_granted()
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
  where d.id = new.document_id;

  insert into public.audit_events (
    event_type, actor_user_id, asset_id, document_id, details
  ) values (
    'ACCESS_GRANTED', new.granted_by, v_asset_id, new.document_id,
    jsonb_build_object('grantee_user_id', new.user_id)
  );

  return new;
end;
$$;

revoke execute on function private.log_data_room_access_granted() from public, anon, authenticated;

create trigger data_room_access_audit_grant
after insert on public.data_room_access
for each row execute function private.log_data_room_access_granted();

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
