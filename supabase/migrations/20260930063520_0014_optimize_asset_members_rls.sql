drop policy if exists asset_members_select_own on public.asset_members;
drop policy if exists asset_members_select_by_asset_owner on public.asset_members;
drop policy if exists asset_members_insert_by_asset_owner on public.asset_members;

create policy asset_members_select_authorized
on public.asset_members
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.assets a
    where a.id = asset_members.asset_id
      and a.created_by = (select auth.uid())
  )
);

create policy asset_members_insert_by_asset_owner
on public.asset_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.assets a
    where a.id = asset_members.asset_id
      and a.created_by = (select auth.uid())
  )
);
