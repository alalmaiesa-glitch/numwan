with product as (
  select id,created_by
  from public.store_products
  where slug='saudi-industrial-intelligence-v1'
)
insert into public.store_product_files (
  product_id,file_label,storage_path,mime_type,file_version,is_active,created_by
)
select product.id,x.file_label,x.storage_path,x.mime_type,'1.0',true,product.created_by
from product
cross join (
  values
    ('Master Dataset — XLSX','generated://product1/master.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    ('Master Dataset — CSV','generated://product1/master.csv','text/csv'),
    ('Data Dictionary','generated://product1/data_dictionary.csv','text/csv'),
    ('Source & Rights Register','generated://product1/source_rights_register.csv','text/csv'),
    ('Release Notes','generated://product1/release_notes.txt','text/plain'),
    ('Buyer Guide','generated://product1/buyer_guide.txt','text/plain')
) as x(file_label,storage_path,mime_type)
on conflict (storage_path) do update set
  product_id=excluded.product_id,
  file_label=excluded.file_label,
  mime_type=excluded.mime_type,
  file_version=excluded.file_version,
  is_active=true,
  created_by=excluded.created_by;

update public.store_products
set
  delivery_status='READY',
  delivery_ready_at=now(),
  delivery_notes='Six entitlement-protected files are generated on demand from the normalized Product 1 master dataset: XLSX, CSV, data dictionary, source/rights register, release notes, and buyer guide.',
  updated_at=now()
where slug='saudi-industrial-intelligence-v1';
