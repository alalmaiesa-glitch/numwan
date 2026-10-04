create index if not exists store_products_asset_id_idx
  on public.store_products(asset_id)
  where asset_id is not null;

create index if not exists store_products_created_by_idx
  on public.store_products(created_by);

create index if not exists store_product_files_product_id_idx
  on public.store_product_files(product_id);

create index if not exists store_product_files_created_by_idx
  on public.store_product_files(created_by);

create index if not exists store_entitlements_order_id_idx
  on public.store_entitlements(order_id);

create index if not exists store_entitlements_product_id_idx
  on public.store_entitlements(product_id);

create index if not exists store_download_events_product_file_id_idx
  on public.store_download_events(product_file_id);

create index if not exists store_download_events_user_id_idx
  on public.store_download_events(user_id)
  where user_id is not null;
