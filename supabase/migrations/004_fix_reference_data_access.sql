-- Fix access to shared reference data (emotions and prayer lines).
-- Safe to run after the first three migrations.

grant usage on schema public to anon, authenticated;
grant select on public.emotions to anon, authenticated;
grant select on public.prayer_lines to anon, authenticated;

alter table public.emotions enable row level security;
alter table public.prayer_lines enable row level security;

drop policy if exists "reference emotions readable" on public.emotions;
create policy "reference emotions readable"
on public.emotions
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "reference prayer lines readable" on public.prayer_lines;
create policy "reference prayer lines readable"
on public.prayer_lines
for select
to anon, authenticated
using (is_active = true);

create or replace function public.get_active_emotions()
returns setof public.emotions
language sql
stable
security definer
set search_path = public
as $$
  select e.*
  from public.emotions e
  where e.is_active = true
  order by e.sort_order, e.id;
$$;

revoke all on function public.get_active_emotions() from public;
grant execute on function public.get_active_emotions() to anon, authenticated;

create or replace function public.get_daily_prayer_lines(requested_count integer default 2)
returns setof public.prayer_lines
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from public.prayer_lines p
  where p.is_active = true
  order by md5(p.id::text || current_date::text || coalesce(auth.uid()::text, 'anonymous'))
  limit greatest(1, least(coalesce(requested_count, 2), 3));
$$;

revoke all on function public.get_daily_prayer_lines(integer) from public;
grant execute on function public.get_daily_prayer_lines(integer) to anon, authenticated;
