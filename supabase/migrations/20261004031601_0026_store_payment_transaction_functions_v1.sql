create or replace function public.create_store_order_v1(
  p_product_id uuid,
  p_buyer_user_id uuid,
  p_buyer_email text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product public.store_products%rowtype;
  v_order_id uuid;
begin
  if p_buyer_user_id is null then
    raise exception 'BUYER_USER_REQUIRED';
  end if;

  if length(btrim(coalesce(p_buyer_email,''))) = 0 then
    raise exception 'BUYER_EMAIL_REQUIRED';
  end if;

  select *
    into v_product
  from public.store_products
  where id = p_product_id
    and status = 'PUBLISHED'
    and rights_status = 'CLEARED'
    and delivery_status = 'READY'
    and checkout_status = 'READY'
  for share;

  if not found then
    raise exception 'PRODUCT_NOT_AVAILABLE';
  end if;

  insert into public.store_orders (
    merchant_user_id,
    buyer_user_id,
    buyer_email,
    status,
    currency,
    subtotal_sar,
    total_sar
  ) values (
    v_product.created_by,
    p_buyer_user_id,
    lower(btrim(p_buyer_email)),
    'PENDING',
    'SAR',
    v_product.price_sar,
    v_product.price_sar
  )
  returning id into v_order_id;

  insert into public.store_order_items (
    order_id,
    product_id,
    title_snapshot,
    license_tier,
    quantity,
    unit_price_sar,
    line_total_sar
  ) values (
    v_order_id,
    v_product.id,
    v_product.title_ar,
    v_product.license_tier,
    1,
    v_product.price_sar,
    v_product.price_sar
  );

  return v_order_id;
end;
$$;

revoke all on function public.create_store_order_v1(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.create_store_order_v1(uuid,uuid,text) to service_role;

create or replace function public.mark_store_order_awaiting_payment_v1(
  p_order_id uuid,
  p_provider text,
  p_provider_checkout_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if length(btrim(coalesce(p_provider,''))) = 0
     or length(btrim(coalesce(p_provider_checkout_id,''))) = 0 then
    raise exception 'PAYMENT_PROVIDER_REFERENCE_REQUIRED';
  end if;

  update public.store_orders
  set
    status = 'AWAITING_PAYMENT',
    payment_provider = p_provider,
    provider_checkout_id = p_provider_checkout_id,
    updated_at = now()
  where id = p_order_id
    and status = 'PENDING';

  if not found then
    raise exception 'ORDER_NOT_PENDING';
  end if;
end;
$$;

revoke all on function public.mark_store_order_awaiting_payment_v1(uuid,text,text) from public, anon, authenticated;
grant execute on function public.mark_store_order_awaiting_payment_v1(uuid,text,text) to service_role;

create or replace function public.finalize_store_payment_v1(
  p_order_code text,
  p_provider text,
  p_provider_payment_id text,
  p_provider_reference text,
  p_amount_sar numeric,
  p_paid_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.store_orders%rowtype;
begin
  if length(btrim(coalesce(p_order_code,''))) = 0
     or length(btrim(coalesce(p_provider,''))) = 0
     or length(btrim(coalesce(p_provider_payment_id,''))) = 0 then
    raise exception 'PAYMENT_REFERENCE_REQUIRED';
  end if;

  select *
    into v_order
  from public.store_orders
  where order_code = p_order_code
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_order.status = 'PAID' then
    if v_order.payment_provider = p_provider
       and v_order.provider_payment_id = p_provider_payment_id then
      return v_order.id;
    end if;
    raise exception 'ORDER_ALREADY_PAID_WITH_DIFFERENT_PAYMENT';
  end if;

  if v_order.status not in ('PENDING','AWAITING_PAYMENT') then
    raise exception 'ORDER_NOT_PAYABLE';
  end if;

  if round(coalesce(p_amount_sar,0),2) <> round(v_order.total_sar,2) then
    raise exception 'PAYMENT_AMOUNT_MISMATCH';
  end if;

  update public.store_orders
  set
    status = 'PAID',
    payment_provider = p_provider,
    provider_payment_id = p_provider_payment_id,
    provider_reference = p_provider_reference,
    paid_at = coalesce(p_paid_at,now()),
    updated_at = now()
  where id = v_order.id;

  insert into public.store_entitlements (
    order_id,
    order_item_id,
    product_id,
    user_id,
    buyer_email,
    status
  )
  select
    oi.order_id,
    oi.id,
    oi.product_id,
    v_order.buyer_user_id,
    v_order.buyer_email,
    'ACTIVE'
  from public.store_order_items oi
  where oi.order_id = v_order.id
  on conflict (order_item_id) do nothing;

  return v_order.id;
end;
$$;

revoke all on function public.finalize_store_payment_v1(text,text,text,text,numeric,timestamptz) from public, anon, authenticated;
grant execute on function public.finalize_store_payment_v1(text,text,text,text,numeric,timestamptz) to service_role;
