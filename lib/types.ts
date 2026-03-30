export type CharacterName = {
  name: string;
  ruby: string;
};

export type WorksFlags = {
  ie1: boolean;
  ie2: boolean;
  ie3: boolean;
  go1: boolean;
  go2: boolean;
  go3: boolean;
  ars: boolean;
  ori: boolean;
  vic: boolean;
};

export type ScrapedCharacterIndex = {
  detailUrl: string;
  characterNo: string;
  fullName: CharacterName;
  team: string[];
  worksFlags: WorksFlags;
};

export type CharacterHowToGet = {
  title: string;
  details: CharacterHowToGetDetail[];
};

export type CharacterHowToGetDetail = {
  description: string | null;
  items: string[];
};

export type ScrapedCharacterDetail = {
  detailUrl: string;
  characterNo: string;
  team: string[];
  worksFlags: WorksFlags;
  nickname: CharacterName[];
  fullName: CharacterName;
  howToGet: CharacterHowToGet[];
  imageUrl: string;
  works: string;
  description: string;
  position: string;
  element: string;
  kick: number | null;
  control: number | null;
  technique: number | null;
  pressure: number | null;
  physical: number | null;
  agility: number | null;
  intelligence: number | null;
  generation: string;
  schoolYear: string;
  gender: string;
  characterRole: string;
  fetchedAt: string;
};

export type ScrapedCharacterDetailWithMetrics = ScrapedCharacterDetail & {
  totalStatus: number | null;
  shootAT: number | null;
  focusAT: number | null;
  focusDF: number | null;
  scrambleAT: number | null;
  scrambleDF: number | null;
  wallDF: number | null;
  KP: number | null;
};

export type PlayerMasterVariant = {
  name: string;
  gender: string;
  element: string;
  position: string;
  build: string;
  note: string;
};

export type PlayerMasterEntry = {
  id: string;
  variants: PlayerMasterVariant[];
};

export type ScrapedCharacterDetailRow = {
  character_no: number;
  detail_url: string;
  team: string[];
  works_flags: WorksFlags;
  nickname: CharacterName[];
  full_name: CharacterName;
  how_to_get: CharacterHowToGet[];
  image_url: string;
  works: string;
  description: string;
  position: string;
  element: string;
  kick: number | null;
  control: number | null;
  technique: number | null;
  pressure: number | null;
  physical: number | null;
  agility: number | null;
  intelligence: number | null;
  generation: string;
  school_year: string;
  gender: string;
  character_role: string;
  fetched_at: string;
  total_status: number | null;
  shoot_at: number | null;
  focus_at: number | null;
  focus_df: number | null;
  scramble_at: number | null;
  scramble_df: number | null;
  wall_df: number | null;
  kp: number | null;
  created_at: string;
  updated_at: string;
};
