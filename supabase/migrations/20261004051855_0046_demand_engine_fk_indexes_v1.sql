create index if not exists store_public_snapshots_created_by_idx
  on public.store_public_snapshots(created_by);

create index if not exists store_target_accounts_created_by_idx
  on public.store_target_accounts(created_by);
