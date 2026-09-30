create index asset_members_user_id_idx on public.asset_members(user_id);
create index if not exists assets_created_by_idx on public.assets(created_by);

create policy asset_members_select_own
on public.asset_members
for select
to authenticated
using (user_id = auth.uid());
