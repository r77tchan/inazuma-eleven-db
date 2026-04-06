-- Supabase SQL Editor で新規作成時に実行する用のスキーマ定義
-- ScrapedCharacterDetailWithMetrics を保存する

create table public.scraped_character_details (
  character_no integer primary key,
  detail_url text not null,
  team text[] not null default '{}'::text[],
  works_flags jsonb not null default '{}'::jsonb,
  nickname jsonb not null default '[]'::jsonb,
  full_name jsonb not null default '{"name":"","ruby":""}'::jsonb,
  how_to_get jsonb not null default '[]'::jsonb,
  image_url text not null default '',
  works text not null default '',
  description text not null default '',
  position text not null default '',
  element text not null default '',
  kick integer,
  control integer,
  technique integer,
  pressure integer,
  physical integer,
  agility integer,
  intelligence integer,
  generation text not null default '',
  school_year text not null default '',
  gender text not null default '',
  character_role text not null default '',
  fetched_at timestamptz not null,
  total_status numeric(10, 1),
  shoot_at numeric(10, 1),
  focus_at numeric(10, 1),
  focus_df numeric(10, 1),
  scramble_at numeric(10, 1),
  scramble_df numeric(10, 1),
  wall_df numeric(10, 1),
  kp numeric(10, 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scraped_character_details_detail_url_idx
  on public.scraped_character_details (detail_url);

create index scraped_character_details_fetched_at_idx
  on public.scraped_character_details (fetched_at desc);

create or replace function public.truncate_scraped_character_details()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  select count(*)::integer into deleted_count
  from public.scraped_character_details;

  truncate table public.scraped_character_details;

  return deleted_count;
end;
$$;

revoke all on function public.truncate_scraped_character_details() from public;
revoke all on function public.truncate_scraped_character_details() from anon;
revoke all on function public.truncate_scraped_character_details() from authenticated;
grant execute on function public.truncate_scraped_character_details() to service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger scraped_character_details_set_updated_at
before update on public.scraped_character_details
for each row execute function public.set_updated_at();
