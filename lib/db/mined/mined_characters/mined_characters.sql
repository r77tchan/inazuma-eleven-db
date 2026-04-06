-- Supabase SQL Editor で実行する用のスキーマ定義
-- MinedCharacterRow を保存する

create table public.mined_characters (
  character_id text primary key,
  full_name text not null default '',
  full_name_ruby text not null default '',
  nickname text not null default '',
  nickname_ruby text not null default '',
  position text not null default '',
  sub_position text not null default '',
  element text not null default '',
  gender text not null default '',
  physique text not null default '',
  build_type text not null default '',
  description text not null default '',
  kick_legend integer not null default 0,
  control_legend integer not null default 0,
  technique_legend integer not null default 0,
  pressure_legend integer not null default 0,
  physical_legend integer not null default 0,
  intelligence_legend integer not null default 0,
  agility_legend integer not null default 0,
  total_status_legend integer not null default 0,
  kick_basara integer not null default 0,
  control_basara integer not null default 0,
  technique_basara integer not null default 0,
  pressure_basara integer not null default 0,
  physical_basara integer not null default 0,
  intelligence_basara integer not null default 0,
  agility_basara integer not null default 0,
  total_status_basara integer not null default 0,
  image_url text not null default '',
  is_obtainable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mined_characters_position_idx
  on public.mined_characters (position);

create index mined_characters_element_idx
  on public.mined_characters (element);

create trigger mined_characters_set_updated_at
before update on public.mined_characters
for each row execute function public.set_updated_at();
