create policy asset_members_select_by_asset_owner on public.asset_members for select to authenticated using (
exists (select 1 from public.assets a where a.id = asset_members.asset_id and a.created_by = auth.uid())
);
