create table public.deals (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_asset_id_idx on public.deals(asset_id);
create index deals_created_by_idx on public.deals(created_by);

alter table public.deals enable row level security;

create table public.deal_participants (
  deal_id uuid not null references public.deals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  added_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (deal_id, user_id)
);

create index deal_participants_user_id_idx on public.deal_participants(user_id);
create index deal_participants_added_by_idx on public.deal_participants(added_by);

alter table public.deal_participants enable row level security;

create or replace function private.is_deal_asset_owner(p_deal_id uuid)
returns boolean
language sql stable security definer set search_path=''
as $$
 select (select auth.uid()) is not null
 and exists (
   select 1 from public.deals d
   join public.assets a on a.id=d.asset_id
   where d.id=p_deal_id and a.created_by=(select auth.uid())
 );
$$;

create or replace function private.is_deal_participant(p_deal_id uuid)
returns boolean
language sql stable security definer set search_path=''
as $$
 select (select auth.uid()) is not null
 and exists (
   select 1 from public.deal_participants dp
   where dp.deal_id=p_deal_id and dp.user_id=(select auth.uid())
 );
$$;

revoke execute on function private.is_deal_asset_owner(uuid) from public, anon;
revoke execute on function private.is_deal_participant(uuid) from public, anon;
grant execute on function private.is_deal_asset_owner(uuid) to authenticated;
grant execute on function private.is_deal_participant(uuid) to authenticated;

create policy deals_select_authorized on public.deals
for select to authenticated
using (
 created_by=(select auth.uid())
 or (select private.is_deal_asset_owner(id))
 or (select private.is_deal_participant(id))
);

create policy deals_insert_asset_owner on public.deals
for insert to authenticated
with check (
 created_by=(select auth.uid())
 and exists (
   select 1 from public.assets a
   where a.id=asset_id and a.created_by=(select auth.uid())
 )
);

create policy deal_participants_select_authorized on public.deal_participants
for select to authenticated
using (
 user_id=(select auth.uid())
 or (select private.is_deal_asset_owner(deal_id))
);

create policy deal_participants_insert_asset_owner on public.deal_participants
for insert to authenticated
with check (
 added_by=(select auth.uid())
 and (select private.is_deal_asset_owner(deal_id))
);

create policy deal_participants_delete_asset_owner on public.deal_participants
for delete to authenticated
using ((select private.is_deal_asset_owner(deal_id)));
