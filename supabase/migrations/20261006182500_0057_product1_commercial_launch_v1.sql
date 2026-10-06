do $$
declare
  v_status text;
  v_rights text;
  v_delivery text;
  v_checkout text;
  v_price numeric;
  v_files integer;
begin
  select
    p.status,
    p.rights_status,
    p.delivery_status,
    p.checkout_status,
    p.price_sar,
    count(f.id) filter (where f.is_active=true)
  into v_status,v_rights,v_delivery,v_checkout,v_price,v_files
  from public.store_products p
  left join public.store_product_files f on f.product_id=p.id
  where p.slug='saudi-industrial-intelligence-v1'
  group by p.id,p.status,p.rights_status,p.delivery_status,p.checkout_status,p.price_sar;

  if v_status is null then
    raise exception 'PRODUCT_NOT_FOUND';
  end if;

  if v_rights <> 'CLEARED' then
    raise exception 'RIGHTS_NOT_CLEARED';
  end if;

  if v_delivery <> 'READY' or coalesce(v_files,0) < 1 then
    raise exception 'DELIVERY_NOT_READY';
  end if;

  if v_price <> 349.00 then
    raise exception 'PRICE_MISMATCH';
  end if;

  update public.store_products
  set
    status='PUBLISHED',
    checkout_status='READY',
    checkout_notes='EdfaPay production checkout verified end-to-end with real 5 SAR transaction before commercial launch.',
    checkout_ready_at=coalesce(checkout_ready_at,now()),
    published_at=coalesce(published_at,now()),
    updated_at=now()
  where slug='saudi-industrial-intelligence-v1';
end $$;
