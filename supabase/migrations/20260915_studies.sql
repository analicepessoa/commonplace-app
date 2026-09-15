-- Central de Estudos — estrutura preparada para as fases de planejamento,
-- foco, sessões, progresso, caixa de entrada e revisões.

create table if not exists public.study_areas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '📚',
  category text,
  objective text,
  priority text not null default 'important'
    check (priority in ('essential', 'important', 'optional')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table if not exists public.study_contents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  area_id uuid not null references public.study_areas(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'active'
    check (status in ('active', 'mastered', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, area_id, title)
);

create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  area_id uuid not null references public.study_areas(id) on delete cascade,
  content_id uuid references public.study_contents(id) on delete set null,
  title text not null,
  description text,
  scheduled_date date not null,
  estimated_minutes integer not null default 30 check (estimated_minutes between 0 and 1440),
  priority text not null default 'important'
    check (priority in ('essential', 'important', 'optional')),
  material_url text,
  recurrence text not null default 'none'
    check (recurrence in ('none', 'weekly', 'monthly')),
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'completed', 'postponed', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  area_id uuid not null references public.study_areas(id) on delete cascade,
  content_id uuid references public.study_contents(id) on delete set null,
  task_id uuid references public.study_tasks(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  paused_seconds integer not null default 0 check (paused_seconds >= 0),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  difficulty text check (difficulty is null or difficulty in ('easy', 'normal', 'hard')),
  needs_review boolean not null default false,
  review_resolved_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.study_inbox (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  text text not null,
  bucket text not null default 'inbox' check (bucket in ('inbox', 'someday')),
  area_id uuid references public.study_areas(id) on delete set null,
  converted_to_task_id uuid references public.study_tasks(id) on delete set null,
  converted_to_content_id uuid references public.study_contents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_areas_owner_active_idx
  on public.study_areas (owner_id, active);
create index if not exists study_contents_area_idx
  on public.study_contents (owner_id, area_id);
create index if not exists study_tasks_week_idx
  on public.study_tasks (owner_id, scheduled_date);
create index if not exists study_tasks_area_idx
  on public.study_tasks (owner_id, area_id, scheduled_date);
create index if not exists study_sessions_period_idx
  on public.study_sessions (owner_id, started_at);
create index if not exists study_inbox_bucket_idx
  on public.study_inbox (owner_id, bucket, created_at);

alter table public.study_areas enable row level security;
alter table public.study_contents enable row level security;
alter table public.study_tasks enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_inbox enable row level security;

create policy "study_areas_owner" on public.study_areas for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "study_contents_owner" on public.study_contents for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "study_tasks_owner" on public.study_tasks for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "study_sessions_owner" on public.study_sessions for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "study_inbox_owner" on public.study_inbox for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

