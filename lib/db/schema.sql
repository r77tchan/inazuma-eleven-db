-- SupabaseのSQLエディタで実行する用のスキーマ定義ファイル
-- scraped_character_details: スクレイピングした選手(キャラ)詳細を保存
-- nickname / full_name は順序が重要なので JSONB配列で保持
-- fetched_at はクエリしやすい timestamptz で保持
create table if not exists public.scraped_character_details (
  character_no integer primary key,
  detail_url text not null,
  nickname jsonb not null default '[]'::jsonb,
  full_name jsonb not null default '[]'::jsonb,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists scraped_character_details_fetched_at_idx on public.scraped_character_details (fetched_at desc);
-- updated_at を自動更新したい場合はトリガーを追加
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now();
return new;
end;
$$;
do $$ begin if not exists (
  select 1
  from pg_trigger
  where tgname = 'scraped_character_details_set_updated_at'
) then create trigger scraped_character_details_set_updated_at before
update on public.scraped_character_details for each row execute function public.set_updated_at();
end if;
end;
$$;