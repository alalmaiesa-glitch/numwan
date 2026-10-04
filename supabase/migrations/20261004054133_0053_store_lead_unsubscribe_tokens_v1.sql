alter table public.store_leads
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists store_leads_unsubscribe_token_unique_idx
  on public.store_leads(unsubscribe_token);

create index if not exists store_leads_status_email_idx
  on public.store_leads(status,email);
