drop policy if exists data_room_documents_select_asset_owner on public.data_room_documents;

create policy data_room_documents_select_authorized
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
  or exists (
    select 1
    from public.data_room_access dra
    where dra.document_id = data_room_documents.id
      and dra.user_id = (select auth.uid())
  )
);
