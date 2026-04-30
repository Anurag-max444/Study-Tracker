-- ================================================
-- StudyVault - Supabase Database Schema
-- Supabase SQL Editor mein yeh poora paste karo
-- ================================================

-- 1. Tasks table
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  subject text not null default 'Math',
  priority text not null default 'medium',
  done boolean not null default false,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- 2. Study logs (daily hours tracker)
create table if not exists public.study_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  hours numeric(4,2) not null default 0,
  sessions integer not null default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- 3. Subject progress
create table if not exists public.subject_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  percentage integer not null default 0,
  chapters_done jsonb not null default '[]',
  updated_at timestamptz default now(),
  unique(user_id, subject)
);

-- 4. Notes
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  subject text not null default 'Other',
  created_at timestamptz default now()
);

-- 5. Goals
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  type text not null default 'short',
  progress integer not null default 0,
  target_date date,
  created_at timestamptz default now()
);

-- 6. Mock tests
create table if not exists public.mock_tests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  test_name text not null,
  exam_type text not null default 'SSC CHSL',
  subject text not null default 'Full Test',
  score integer not null,
  total integer not null,
  date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- ================================================
-- Row Level Security (RLS) — BAHUT IMPORTANT
-- Har user sirf apna data dekh sakta hai
-- ================================================

alter table public.tasks enable row level security;
alter table public.study_logs enable row level security;
alter table public.subject_progress enable row level security;
alter table public.notes enable row level security;
alter table public.goals enable row level security;
alter table public.mock_tests enable row level security;

-- Tasks policies
create policy "Users can manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Study logs policies
create policy "Users can manage own study_logs"
  on public.study_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Subject progress policies
create policy "Users can manage own subject_progress"
  on public.subject_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notes policies
create policy "Users can manage own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Goals policies
create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Mock tests policies
create policy "Users can manage own mock_tests"
  on public.mock_tests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ================================================
-- Done! Ab wapas Render pe deploy karo.
-- ================================================
