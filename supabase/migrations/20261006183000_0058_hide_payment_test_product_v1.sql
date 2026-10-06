update public.store_products
set
  status='DRAFT',
  checkout_status='NOT_READY',
  is_featured=false,
  checkout_notes='Internal payment validation product. Hidden after successful end-to-end production test.',
  updated_at=now()
where slug='payment-test-5-sar';
