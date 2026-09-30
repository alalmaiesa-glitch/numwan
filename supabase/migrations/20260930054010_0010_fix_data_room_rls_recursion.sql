create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_data_room_document_owner(p_document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.data_room_documents d
      join public.assets a on a.id = d.asset_id
      where d.id = p_document_id
        and a.created_by = (select auth.uid())
    );
$$;

create or replace function private.can_read_data_room_document(p_document_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and (
      exists (
        select 1
        from public.data_room_documents d
        join public.assets a on a.id = d.asset_id
        where d.id = p_document_id
          and a.created_by = (select auth.uid())
      )
      or exists (
        select 1
        from public.data_room_access dra
        where dra.document_id = p_document_id
          and dra.user_id = (select auth.uid())
      )
    );
$$;

revoke execute on function private.is_data_room_document_owner(uuid) from public, anon;
revoke execute on function private.can_read_data_room_document(uuid) from public, anon;
grant execute on function private.is_data_room_document_owner(uuid) to authenticated;
grant execute on function private.can_read_data_room_document(uuid) to authenticated;

drop policy if exists data_room_documents_select_authorized on public.data_room_documents;
create policy data_room_documents_select_authorized
on public.data_room_documents
for select
to authenticated
using ((select private.can_read_data_room_document(id)));

drop policy if exists data_room_access_select_authorized on public.data_room_access;
create policy data_room_access_select_authorized
on public.data_room_access
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_data_room_document_owner(document_id))
);
