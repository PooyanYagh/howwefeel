-- DailyMood Habits v2
-- WARNING: this migration deletes all previous habit data.

drop table if exists public.habit_logs cascade;
drop table if exists public.habit_schedules cascade;
drop table if exists public.habits cascade;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  icon text default '✨',
  color text default '#8b5cf6',
  target_days smallint[] not null default array[0,1,2,3,4,5,6]::smallint[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habits_title_not_empty check (length(trim(title)) > 0),
  constraint habits_target_days_valid check (target_days <@ array[0,1,2,3,4,5,6]::smallint[])
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  status text not null check (status in ('done','missed','skipped')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habit_logs_unique_day unique (habit_id, log_date)
);

create index habits_user_active_idx on public.habits(user_id, is_active);
create index habit_logs_user_date_idx on public.habit_logs(user_id, log_date desc);
create index habit_logs_habit_date_idx on public.habit_logs(habit_id, log_date desc);

create trigger habits_set_updated_at before update on public.habits
for each row execute function public.set_updated_at();

create trigger habit_logs_set_updated_at before update on public.habit_logs
for each row execute function public.set_updated_at();

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "Users can manage own habits"
on public.habits for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read own habit logs"
on public.habit_logs for select to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.habits h
    where h.id = habit_logs.habit_id and h.user_id = auth.uid()
  )
);

create policy "Users can create own habit logs"
on public.habit_logs for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.habits h
    where h.id = habit_logs.habit_id and h.user_id = auth.uid()
  )
);

create policy "Users can update own habit logs"
on public.habit_logs for update to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.habits h
    where h.id = habit_logs.habit_id and h.user_id = auth.uid()
  )
);

create policy "Users can delete own habit logs"
on public.habit_logs for delete to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete on public.habits to authenticated;
grant select, insert, update, delete on public.habit_logs to authenticated;
