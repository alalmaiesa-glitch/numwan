update public.store_products
set
  status='DRAFT',
  checkout_status='NOT_READY',
  is_featured=false,
  checkout_notes='Temporarily hidden from storefront by owner request pending product review.',
  updated_at=now()
where slug='saudi-industrial-intelligence-v1';
