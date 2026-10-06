update public.store_products
set
  title_ar='NUMWAN Payment Test — 5 SAR',
  title_en='NUMWAN Payment Test — 5 SAR',
  summary_ar='منتج تجريبي مستقل بقيمة 5 ريال لاختبار دورة الدفع والاستحقاق والتنزيل في نُموان.',
  summary_en='A standalone SAR 5 product for validating Numwan payment, entitlement, and download flow.',
  delivery_notes='Entitlement-protected generated test file for end-to-end payment validation.',
  updated_at=now()
where slug='payment-test-5-sar';

with product as (
  select id,created_by
  from public.store_products
  where slug='payment-test-5-sar'
)
insert into public.store_product_files (
  product_id,
  file_label,
  storage_path,
  mime_type,
  file_version,
  is_active,
  created_by
)
select
  product.id,
  'NUMWAN Payment Test — Test File',
  'generated://payment-test/receipt.txt',
  'text/plain',
  'test-1',
  true,
  product.created_by
from product
on conflict (storage_path) do update
set
  product_id=excluded.product_id,
  file_label=excluded.file_label,
  mime_type=excluded.mime_type,
  file_version=excluded.file_version,
  is_active=true,
  created_by=excluded.created_by;
