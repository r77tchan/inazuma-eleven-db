-- Supabase SQL Editor で実行する用のスキーマ定義
-- 6つのテーブルをまとめて作成する

create table public.status_types (
  id serial primary key,
  name text not null,
  rarity text not null default 'unknown',
  image_url text,
  kick integer,
  control integer,
  technique integer,
  pressure integer,
  physical integer,
  intelligence integer,
  agility integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mined_characters (
  character_id text primary key,
  full_name text not null default '',
  full_name_ruby text not null default '',
  nickname text not null default '',
  nickname_ruby text not null default '',
  inagle_no integer,
  position text not null default '',
  sub_position text not null default '',
  element text not null default '',
  gender text not null default '',
  physique text not null default '',
  build_type text not null default '',
  description text not null default '',
  image_url text not null default '',
  is_obtainable boolean not null default false,
  normal_slot_1 text,
  normal_slot_2 text,
  normal_slot_3 text,
  normal_default_slot_4 text,
  normal_default_slot_5 text,
  normal_default_slot_6 text,
  normal_branch_slot_4 text,
  normal_branch_slot_5 text,
  normal_branch_slot_6 text,
  legend_status_type_default integer not null references public.status_types(id),
  legend_status_type_branch integer not null references public.status_types(id),
  inagle_url text,
  team jsonb,
  works_flags jsonb,
  how_to_get jsonb,
  generation text,
  school_year text,
  character_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mined_skills (
  skill_id text primary key,
  name text not null default '',
  name_ruby text not null default '',
  type text not null default '',
  option text,
  element text not null default '',
  number_of_people integer not null default 0,
  foul_rate integer not null default 0,
  description text not null default '',
  tension_normal integer,
  power_normal integer,
  recast_normal integer,
  tension_mm integer,
  power_mm integer,
  recast_mm integer,
  tension_or integer,
  power_or integer,
  recast_or integer,
  tension_keshin integer,
  power_keshin integer,
  recast_keshin integer,
  tension_soul integer,
  power_soul integer,
  recast_soul integer,
  is_normal boolean not null default false,
  is_mm boolean not null default false,
  is_or boolean not null default false,
  is_keshin boolean not null default false,
  is_soul boolean not null default false,
  aura_id text,
  where_to_get text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mined_auras (
  aura_id text primary key,
  name text not null default '',
  name_ruby text not null default '',
  type text not null default '',
  category text,
  element text not null default '',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mined_skill_voices (
  id serial primary key,
  character_id text not null,
  skill_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mined_aura_voices (
  id serial primary key,
  character_id text not null,
  aura_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
