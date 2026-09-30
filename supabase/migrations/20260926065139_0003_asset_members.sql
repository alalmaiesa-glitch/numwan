create table public.asset_members (
  asset_id uuid not null references public.assets(id),
  user_id uuid not null references auth.users(id),
  member_role text not null,
  created_at timestamptz not null default now(),
  primary key (asset_id,user_id)
);

alter table public.asset_members enable row level security;
