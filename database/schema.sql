create table if not exists dealer_demo_workspaces (
  id uuid primary key,
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dealer_demo_workspaces_updated_at_idx
  on dealer_demo_workspaces (updated_at desc);
