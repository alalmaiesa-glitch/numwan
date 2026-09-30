create policy asset_members_insert_by_asset_owner
on public.asset_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.assets a
    where a.id = asset_members.asset_id
      and a.created_by = auth.uid()
  )
);
