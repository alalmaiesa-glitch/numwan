create table public.data_room_access (
  document_id uuid not null references public.data_room_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  granted_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (document_id, user_id)
);

create index data_room_access_user_id_idx on public.data_room_access(user_id);
create index data_room_access_granted_by_idx on public.data_room_access(granted_by);

alter table public.data_room_access enable row level security;

create policy data_room_access_select_authorized
on public.data_room_access
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.data_room_documents d
    join public.assets a on a.id = d.asset_id
    where d.id = data_room_access.document_id
      and a.created_by = (select auth.uid())
  )
);

create policy data_room_access_insert_asset_owner
on public.data_room_access
for insert
to authenticated
with check (
  granted_by = (select auth.uid())
  and exists (
    select 1
    from public.data_room_documents d
    join public.assets a on a.id = d.asset_id
    where d.id = data_room_access.document_id
      and a.created_by = (select auth.uid())
  )
);

create policy data_room_access_delete_asset_owner
on public.data_room_access
for delete
to authenticated
using (
  exists (
    select 1
    from public.data_room_documents d
    join public.assets a on a.id = d.asset_id
    where d.id = data_room_access.document_id
      and a.created_by = (select auth.uid())
  )
);
