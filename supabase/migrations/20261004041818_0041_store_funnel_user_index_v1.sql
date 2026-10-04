create index if not exists store_funnel_events_user_id_idx
  on public.store_funnel_events(user_id)
  where user_id is not null;
