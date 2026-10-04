alter table public.store_funnel_events
  drop constraint if exists store_funnel_events_type_check;

alter table public.store_funnel_events
  add constraint store_funnel_events_type_check check (
    event_type in ('INSIGHT_VIEW','LANDING_VIEW','PRODUCT_VIEW','SAMPLE_DOWNLOAD')
  );
