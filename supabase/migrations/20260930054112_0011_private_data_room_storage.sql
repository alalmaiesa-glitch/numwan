insert into storage.buckets (id, name, public)
values ('numwan-data-room', 'numwan-data-room', false);

create policy numwan_data_room_select_authorized
on storage.objects
for select
to authenticated
using (
  bucket_id = 'numwan-data-room'
  and exists (
    select 1
    from public.data_room_documents d
    where d.storage_path = storage.objects.name
      and (storage.foldername(storage.objects.name))[1] = d.asset_id::text
      and (storage.foldername(storage.objects.name))[2] = d.id::text
      and (select private.can_read_data_room_document(d.id))
  )
);

create policy numwan_data_room_insert_asset_owner
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'numwan-data-room'
  and exists (
    select 1
    from public.data_room_documents d
    join public.assets a on a.id = d.asset_id
    where d.storage_path = storage.objects.name
      and d.uploaded_by = (select auth.uid())
      and a.created_by = (select auth.uid())
      and (storage.foldername(storage.objects.name))[1] = d.asset_id::text
      and (storage.foldername(storage.objects.name))[2] = d.id::text
  )
);
