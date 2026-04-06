-- Supabase SQL Editor で実行する用のスキーマ定義
-- MinedVoiceRow を保存する

create table public.mined_voices (
  id text primary key,
  character_id text not null references public.mined_characters(character_id),
  skill_id text not null references public.mined_skills(skill_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mined_voices_character_id_idx
  on public.mined_voices (character_id);

create index mined_voices_skill_id_idx
  on public.mined_voices (skill_id);

create trigger mined_voices_set_updated_at
before update on public.mined_voices
for each row execute function public.set_updated_at();
