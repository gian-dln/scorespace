-- ScoreSpace cache schema.
-- Paste this into the Supabase dashboard → SQL Editor → New query → Run.
-- Safe to re-run: everything is idempotent.
--
-- These tables are an IMSLP response cache. `data` holds the normalized
-- Work/Composer JSON (see types/index.ts); `updated_at` drives cache
-- freshness (see lib/supabase/queries.ts).

create table if not exists public.works (
  id         text primary key,
  data       jsonb       not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.composers (
  id         text primary key,
  data       jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Speeds up any future "recently refreshed" / cache-sweep queries.
create index if not exists works_updated_at_idx     on public.works (updated_at);
create index if not exists composers_updated_at_idx on public.composers (updated_at);

-- Enable Row Level Security and add NO policies. The app only ever touches
-- these tables through the server-side service_role key, which bypasses RLS.
-- With RLS on and no policies, the public anon key can't read or write the
-- cache — which is exactly what we want.
alter table public.works     enable row level security;
alter table public.composers enable row level security;
