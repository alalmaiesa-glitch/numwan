revoke all on table public.store_public_snapshots from anon, authenticated;
grant select on table public.store_public_snapshots to anon, authenticated;

revoke all on table public.store_leads from anon, authenticated;
grant select on table public.store_leads to authenticated;

revoke all on table public.store_target_accounts from anon, authenticated;
grant select,insert,update,delete on table public.store_target_accounts to authenticated;
