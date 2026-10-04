create or replace function public.sync_store_campaign_readiness_v1()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
begin
  if new.status='PUBLISHED' and new.checkout_status='READY' then
    update public.store_campaign_assets
    set status='READY',updated_at=now()
    where product_id=new.id
      and phase in ('LAUNCH','FOLLOW_UP')
      and status='BLOCKED_PAYMENT';
  else
    update public.store_campaign_assets
    set status='BLOCKED_PAYMENT',updated_at=now()
    where product_id=new.id
      and phase in ('LAUNCH','FOLLOW_UP')
      and status='READY';
  end if;

  return new;
end;
$$;

drop trigger if exists store_campaign_readiness_sync_v1 on public.store_products;
create trigger store_campaign_readiness_sync_v1
after insert or update of status,checkout_status
on public.store_products
for each row
execute function public.sync_store_campaign_readiness_v1();
