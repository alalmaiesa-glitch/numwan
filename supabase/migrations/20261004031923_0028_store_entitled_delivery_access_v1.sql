create policy store_product_files_entitled_select
on public.store_product_files
for select
to authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.store_entitlements e
    where e.product_id = store_product_files.product_id
      and e.user_id = (select auth.uid())
      and e.status = 'ACTIVE'
      and (e.expires_at is null or e.expires_at > now())
  )
);

create policy store_product_objects_entitled_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'numwan-store-products'
  and exists (
    select 1
    from public.store_product_files pf
    join public.store_entitlements e on e.product_id = pf.product_id
    where pf.storage_path = storage.objects.name
      and pf.is_active = true
      and e.user_id = (select auth.uid())
      and e.status = 'ACTIVE'
      and (e.expires_at is null or e.expires_at > now())
  )
);

grant insert on table public.store_download_events to authenticated;

create policy store_download_events_buyer_insert
on public.store_download_events
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.store_entitlements e
    join public.store_product_files pf on pf.product_id = e.product_id
    where e.id = store_download_events.entitlement_id
      and pf.id = store_download_events.product_file_id
      and e.user_id = (select auth.uid())
      and e.status = 'ACTIVE'
      and (e.expires_at is null or e.expires_at > now())
      and pf.is_active = true
  )
);
