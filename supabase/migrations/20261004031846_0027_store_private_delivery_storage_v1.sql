insert into storage.buckets (id,name,public)
values ('numwan-store-products','numwan-store-products',false)
on conflict (id) do update set public=false;

drop policy if exists store_product_objects_owner_select on storage.objects;
create policy store_product_objects_owner_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'numwan-store-products'
  and exists (
    select 1
    from public.store_products p
    where p.id::text = (storage.foldername(name))[1]
      and p.created_by = (select auth.uid())
  )
);

drop policy if exists store_product_objects_owner_insert on storage.objects;
create policy store_product_objects_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'numwan-store-products'
  and exists (
    select 1
    from public.store_products p
    where p.id::text = (storage.foldername(name))[1]
      and p.created_by = (select auth.uid())
  )
);

drop policy if exists store_product_objects_owner_update on storage.objects;
create policy store_product_objects_owner_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'numwan-store-products'
  and exists (
    select 1
    from public.store_products p
    where p.id::text = (storage.foldername(name))[1]
      and p.created_by = (select auth.uid())
  )
)
with check (
  bucket_id = 'numwan-store-products'
  and exists (
    select 1
    from public.store_products p
    where p.id::text = (storage.foldername(name))[1]
      and p.created_by = (select auth.uid())
  )
);

drop policy if exists store_product_objects_owner_delete on storage.objects;
create policy store_product_objects_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'numwan-store-products'
  and exists (
    select 1
    from public.store_products p
    where p.id::text = (storage.foldername(name))[1]
      and p.created_by = (select auth.uid())
  )
);
