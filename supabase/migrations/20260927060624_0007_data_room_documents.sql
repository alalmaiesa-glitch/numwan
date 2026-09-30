create table public.data_room_documents (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id),
  title text not null check (length(btrim(title)) > 0),
  storage_path text not null unique check (length(btrim(storage_path)) > 0),
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index data_room_documents_asset_id_idx on public.data_room_documents(asset_id);
create index data_room_documents_uploaded_by_idx on public.data_room_documents(uploaded_by);

alter table public.data_room_documents enable row level security;

create policy data_room_documents_select_asset_owner
on public.data_room_documents
for select
to authenticated
using (
  exists (
    select 1
    from public.assets a
    where a.id = data_room_documents.asset_id
      and a.created_by = (select auth.uid())
  )
);

create policy data_room_documents_insert_asset_owner
on public.data_room_documents
for insert
to authenticated
with check (
  uploaded_by = (select auth.uid())
  and exists (
    select 1
    from public.assets a
    where a.id = data_room_documents.asset_id
      and a.created_by = (select auth.uid())
  )
);
