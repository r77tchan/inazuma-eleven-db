-- Supabase SQL Editor で実行する用のスキーマ定義
-- MinedSkillRow を保存する

create table public.mined_skills (
  skill_id text primary key,
  name text not null default '',
  name_ruby text not null default '',
  type text not null default '',
  option text not null default '',
  tension integer not null default 0,
  power integer not null default 0,
  recast integer not null default 0,
  element text not null default '',
  number_of_people integer not null default 0,
  foul_rate integer not null default 0,
  is_mixi_max boolean not null default false,
  is_override boolean not null default false,
  is_keshin boolean not null default false,
  is_soul boolean not null default false,
  where_to_get text not null default '',
  image_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mined_skills_type_idx
  on public.mined_skills (type);

create index mined_skills_element_idx
  on public.mined_skills (element);

create trigger mined_skills_set_updated_at
before update on public.mined_skills
for each row execute function public.set_updated_at();
