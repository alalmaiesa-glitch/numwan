create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  short_description text,
  problem text,
  initial_solution text,
  sector text,
  market text,
  customer text,
  potential_buyer text,
  idea_source text,
  notes text,
  confidentiality_level text not null default 'P0'
    check (confidentiality_level in ('P0','P1','P2','P3')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ideas_created_by_idx on public.ideas(created_by);
create index ideas_confidentiality_level_idx on public.ideas(confidentiality_level);

alter table public.ideas enable row level security;

create policy ideas_select_own
on public.ideas for select to authenticated
using (created_by = (select auth.uid()));

create policy ideas_insert_own
on public.ideas for insert to authenticated
with check (created_by = (select auth.uid()));

create policy ideas_update_own
on public.ideas for update to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

create table public.hypotheses (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  code text not null check (length(btrim(code)) > 0),
  description text not null check (length(btrim(description)) > 0),
  hypothesis_type text,
  importance text not null
    check (importance in ('CRITICAL','MAJOR','SECONDARY')),
  verification_status text not null default 'UNTESTED'
    check (verification_status in ('UNTESTED','TESTING','SUPPORTED','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (idea_id, code)
);

create index hypotheses_idea_id_idx on public.hypotheses(idea_id);
alter table public.hypotheses enable row level security;

create policy hypotheses_select_by_idea_owner
on public.hypotheses for select to authenticated
using (
  exists (
    select 1 from public.ideas i
    where i.id = hypotheses.idea_id
      and i.created_by = (select auth.uid())
  )
);

create policy hypotheses_insert_by_idea_owner
on public.hypotheses for insert to authenticated
with check (
  exists (
    select 1 from public.ideas i
    where i.id = hypotheses.idea_id
      and i.created_by = (select auth.uid())
  )
);

create policy hypotheses_update_by_idea_owner
on public.hypotheses for update to authenticated
using (
  exists (
    select 1 from public.ideas i
    where i.id = hypotheses.idea_id
      and i.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.ideas i
    where i.id = hypotheses.idea_id
      and i.created_by = (select auth.uid())
  )
);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  hypothesis_id uuid not null references public.hypotheses(id) on delete cascade,
  code text not null check (length(btrim(code)) > 0),
  claim text not null check (length(btrim(claim)) > 0),
  source text,
  evidence_date date,
  evidence_type text,
  proves text,
  does_not_prove text,
  evidence_strength text not null
    check (evidence_strength in ('E1','E2','E3','E4','E5')),
  created_at timestamptz not null default now(),
  unique (hypothesis_id, code)
);

create index evidence_hypothesis_id_idx on public.evidence(hypothesis_id);
alter table public.evidence enable row level security;

create policy evidence_select_by_idea_owner
on public.evidence for select to authenticated
using (
  exists (
    select 1
    from public.hypotheses h
    join public.ideas i on i.id = h.idea_id
    where h.id = evidence.hypothesis_id
      and i.created_by = (select auth.uid())
  )
);

create policy evidence_insert_by_idea_owner
on public.evidence for insert to authenticated
with check (
  exists (
    select 1
    from public.hypotheses h
    join public.ideas i on i.id = h.idea_id
    where h.id = evidence.hypothesis_id
      and i.created_by = (select auth.uid())
  )
);

create policy evidence_update_by_idea_owner
on public.evidence for update to authenticated
using (
  exists (
    select 1
    from public.hypotheses h
    join public.ideas i on i.id = h.idea_id
    where h.id = evidence.hypothesis_id
      and i.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.hypotheses h
    join public.ideas i on i.id = h.idea_id
    where h.id = evidence.hypothesis_id
      and i.created_by = (select auth.uid())
  )
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  hypothesis_id uuid not null references public.hypotheses(id) on delete cascade,
  method text not null check (length(btrim(method)) > 0),
  metric text,
  success_criteria text not null check (length(btrim(success_criteria)) > 0),
  failure_criteria text not null check (length(btrim(failure_criteria)) > 0),
  cost numeric check (cost is null or cost >= 0),
  result text,
  decision text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index experiments_hypothesis_id_idx on public.experiments(hypothesis_id);
alter table public.experiments enable row level security;

create policy experiments_select_by_idea_owner
on public.experiments for select to authenticated
using (
  exists (
    select 1
    from public.hypotheses h
    join public.ideas i on i.id = h.idea_id
    where h.id = experiments.hypothesis_id
      and i.created_by = (select auth.uid())
  )
);

create policy experiments_insert_by_idea_owner
on public.experiments for insert to authenticated
with check (
  exists (
    select 1
    from public.hypotheses h
    join public.ideas i on i.id = h.idea_id
    where h.id = experiments.hypothesis_id
      and i.created_by = (select auth.uid())
  )
);

create policy experiments_update_by_idea_owner
on public.experiments for update to authenticated
using (
  exists (
    select 1
    from public.hypotheses h
    join public.ideas i on i.id = h.idea_id
    where h.id = experiments.hypothesis_id
      and i.created_by = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.hypotheses h
    join public.ideas i on i.id = h.idea_id
    where h.id = experiments.hypothesis_id
      and i.created_by = (select auth.uid())
  )
);
