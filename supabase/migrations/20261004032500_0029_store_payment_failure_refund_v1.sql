create or replace function public.fail_store_payment_v1(
  p_order_code text,
  p_provider text,
  p_provider_reference text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
begin
  update public.store_orders
  set
    status = 'FAILED',
    payment_provider = coalesce(nullif(btrim(p_provider),''),payment_provider),
    provider_reference = coalesce(nullif(btrim(p_provider_reference),''),provider_reference),
    updated_at = now()
  where order_code = p_order_code
    and status in ('PENDING','AWAITING_PAYMENT')
  returning id into v_order_id;

  if v_order_id is null then
    raise exception 'ORDER_NOT_FAILABLE';
  end if;

  return v_order_id;
end;
$$;

revoke all on function public.fail_store_payment_v1(text,text,text) from public, anon, authenticated;
grant execute on function public.fail_store_payment_v1(text,text,text) to service_role;

create or replace function public.refund_store_payment_v1(
  p_order_code text,
  p_provider text,
  p_provider_payment_id text,
  p_provider_reference text,
  p_refunded_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.store_orders%rowtype;
begin
  select *
    into v_order
  from public.store_orders
  where order_code = p_order_code
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_order.status = 'REFUNDED' then
    return v_order.id;
  end if;

  if v_order.status <> 'PAID' then
    raise exception 'ORDER_NOT_REFUNDABLE';
  end if;

  if v_order.payment_provider is distinct from p_provider
     or v_order.provider_payment_id is distinct from p_provider_payment_id then
    raise exception 'PAYMENT_REFERENCE_MISMATCH';
  end if;

  update public.store_orders
  set
    status = 'REFUNDED',
    provider_reference = coalesce(nullif(btrim(p_provider_reference),''),provider_reference),
    refunded_at = coalesce(p_refunded_at,now()),
    updated_at = now()
  where id = v_order.id;

  update public.store_entitlements
  set
    status = 'REVOKED',
    revoked_at = coalesce(p_refunded_at,now())
  where order_id = v_order.id
    and status = 'ACTIVE';

  return v_order.id;
end;
$$;

revoke all on function public.refund_store_payment_v1(text,text,text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.refund_store_payment_v1(text,text,text,text,timestamptz) to service_role;
