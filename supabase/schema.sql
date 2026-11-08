-- ပဟေဠိ (TTL games) database: daily results, friend groups, weekly leaderboards.
-- Run once in the Supabase SQL editor. Safe to re-run.
-- Browsers only ever call the functions below (with the public anon key);
-- the tables themselves are locked by row-level security.

create table if not exists public.results (
  player   uuid        not null,
  day      int         not null,
  mode     text        not null check (mode in ('A','B','C')),
  score    int         not null,
  won      boolean     not null,
  created_at timestamptz not null default now(),
  primary key (player, day, mode)
);
create index if not exists results_day_mode on public.results (day, mode);

create table if not exists public.groups (
  code       text primary key,
  name       text not null,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  code      text not null references public.groups(code) on delete cascade,
  player    uuid not null,
  nickname  text not null,
  joined_at timestamptz not null default now(),
  primary key (code, player)
);
create index if not exists members_player on public.members (player);

alter table public.results enable row level security;
alter table public.groups  enable row level security;
alter table public.members enable row level security;
-- No policies on purpose: anon/authenticated cannot read or write tables directly.
revoke all on public.results, public.groups, public.members from anon, authenticated;

-- Puzzle #1 (day 0) = 8 Nov 2026 00:00 Myanmar time (UTC+6:30).
create or replace function public.today_idx() returns int
language sql stable as $$
  select floor(extract(epoch from (now() - timestamptz '2026-11-07 17:30:00+00')) / 86400)::int
$$;

-- Points used by group leaderboards (higher is better).
create or replace function public.points(p_mode text, p_score int, p_won boolean) returns int
language sql immutable as $$
  select case
    when not p_won then 0
    when p_mode = 'A' then greatest(1, 7 - p_score)        -- 1 try = 6 pts … 6 tries = 1 pt
    when p_mode = 'B' then greatest(1, 7 - p_score)        -- 1 check = 6 pts
    when p_mode = 'C' then greatest(1, 6 - p_score)        -- 0 mistakes = 6 pts
  end
$$;

create or replace function public.submit_result(p_player uuid, p_day int, p_mode text, p_score int, p_won boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_mode not in ('A','B','C') then return; end if;
  if p_day < public.today_idx() - 1 or p_day > public.today_idx() + 1 then return; end if; -- only today's puzzle
  if p_score < 0 or p_score > 20 then return; end if;
  insert into results(player, day, mode, score, won) values (p_player, p_day, p_mode, p_score, p_won)
  on conflict do nothing;
end $$;

-- How everyone did on one puzzle: {players, solved, avg, dist:{score:count}}
create or replace function public.day_stats(p_day int, p_mode text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'players', count(*),
    'solved',  count(*) filter (where won),
    'avg',     round(avg(score) filter (where won), 1),
    'dist',    coalesce((select json_object_agg(score, n) from (
                  select score, count(*) n from results where day = p_day and mode = p_mode group by score) d), '{}'::json)
  ) from results where day = p_day and mode = p_mode
$$;

create or replace function public.create_group(p_name text, p_player uuid, p_nick text)
returns text language plpgsql security definer set search_path = public as $$
declare v_code text; alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  p_name := left(trim(p_name), 40); p_nick := left(trim(p_nick), 24);
  if p_name = '' or p_nick = '' then raise exception 'name required'; end if;
  if (select count(*) from groups where created_by = p_player and created_at > now() - interval '1 day') >= 5 then
    raise exception 'too many groups today';
  end if;
  loop
    v_code := '';
    for i in 1..6 loop v_code := v_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from groups where code = v_code);
  end loop;
  insert into groups(code, name, created_by) values (v_code, p_name, p_player);
  insert into members(code, player, nickname) values (v_code, p_player, p_nick);
  return v_code;
end $$;

create or replace function public.join_group(p_code text, p_player uuid, p_nick text)
returns text language plpgsql security definer set search_path = public as $$
declare v_name text;
begin
  p_code := upper(trim(p_code)); p_nick := left(trim(p_nick), 24);
  select name into v_name from groups where code = p_code;
  if v_name is null then raise exception 'group not found'; end if;
  if p_nick = '' then raise exception 'name required'; end if;
  if (select count(*) from members where code = p_code) >= 200 then raise exception 'group is full'; end if;
  insert into members(code, player, nickname) values (p_code, p_player, p_nick)
  on conflict (code, player) do update set nickname = excluded.nickname;
  return v_name;
end $$;

create or replace function public.leave_group(p_code text, p_player uuid)
returns void language sql security definer set search_path = public as $$
  delete from members where code = upper(trim(p_code)) and player = p_player
$$;

-- Weekly leaderboard for a group, days p_from..p_to inclusive.
drop function if exists public.group_board(text,int,int);
create or replace function public.group_board(p_code text, p_from int, p_to int, p_player uuid)
returns table(nickname text, played int, solved int, points int, is_me boolean)
language sql stable security definer set search_path = public as $$
  select m.nickname,
         count(r.day)::int,
         count(r.day) filter (where r.won)::int,
         coalesce(sum(public.points(r.mode, r.score, r.won)), 0)::int,
         bool_or(m.player = p_player)
  from members m
  left join results r on r.player = m.player and r.day between p_from and p_to
  where m.code = upper(trim(p_code))
  group by m.player, m.nickname
  order by 4 desc, 3 desc, 1
$$;

create or replace function public.group_name(p_code text)
returns text language sql stable security definer set search_path = public as $$
  select name from groups where code = upper(trim(p_code))
$$;

revoke all on function public.submit_result, public.day_stats, public.create_group, public.join_group,
  public.leave_group, public.group_board, public.group_name from public;
grant execute on function public.submit_result(uuid,int,text,int,boolean), public.day_stats(int,text),
  public.create_group(text,uuid,text), public.join_group(text,uuid,text), public.leave_group(text,uuid),
  public.group_board(text,int,int,uuid), public.group_name(text) to anon, authenticated;
