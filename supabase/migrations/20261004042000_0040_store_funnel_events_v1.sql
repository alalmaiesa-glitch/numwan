create table public.store_funnel_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products(id) on delete cascade,
  event_type text not null,
  session_id uuid,
  user_id uuid references auth.users(id),
  path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now(),
  constraint store_funnel_events_type_check check (
    event_type in ('PRODUCT_VIEW','SAMPLE_DOWNLOAD')
  )
);

alter table public.store_funnel_events enable row level security;

grant select on table public.store_funnel_events to authenticated;
grant select,insert,update,delete on table public.store_funnel_events to service_role;

create policy store_funnel_events_merchant_read
on public.store_funnel_events
for select
to authenticated
using (
  exists (
    select 1
    from public.store_products p
    where p.id=store_funnel_events.product_id
      and p.created_by=(select auth.uid())
  )
);

create index store_funnel_events_product_type_time_idx
  on public.store_funnel_events(product_id,event_type,created_at desc);

create index store_funnel_events_session_time_idx
  on public.store_funnel_events(session_id,created_at desc)
  where session_id is not null;
