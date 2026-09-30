alter table public.assets
  drop constraint if exists assets_status_v1;

alter table public.assets
  alter column status set default 'IDEA';

alter table public.assets
  add constraint assets_status_v1 check (
    status in (
      'IDEA',
      'RESEARCH',
      'LAB',
      'DEVELOPMENT',
      'READY',
      'LISTED',
      'INTEREST',
      'NEGOTIATION',
      'RESERVED',
      'SOLD',
      'LICENSED',
      'ARCHIVED'
    )
  );

alter table public.assets
  add column disclosure_level text not null default 'P0'
  check (disclosure_level in ('P0','P1','P2','P3'));

alter table public.assets
  add column asset_code text unique
  check (
    asset_code is null
    or asset_code ~ '^NW-[A-Z0-9]+-[0-9]{4}$'
  );

alter table public.deals
  add column status text not null default 'NEW'
  check (
    status in (
      'NEW',
      'QUALIFIED',
      'DATA_ROOM',
      'INTEREST',
      'OFFER',
      'NEGOTIATION',
      'RESERVED',
      'AGREEMENT',
      'SOLD',
      'LICENSED',
      'CLOSED'
    )
  );

create index assets_status_idx on public.assets(status);
create index assets_disclosure_level_idx on public.assets(disclosure_level);
create index deals_status_idx on public.deals(status);
