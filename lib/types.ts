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

export type MinedCharacterRow = {
  character_id: string;
  full_name: string;
  full_name_ruby: string;
  nickname: string;
  nickname_ruby: string;
  inagle_no: number | null;
  position: string;
  sub_position: string;
  element: string;
  gender: string;
  physique: string;
  build_type: string;
  description: string;
  image_url: string;
  is_obtainable: boolean;
  normal_slot_1: string | null;
  normal_slot_2: string | null;
  normal_slot_3: string | null;
  normal_default_slot_4: string | null;
  normal_default_slot_5: string | null;
  normal_default_slot_6: string | null;
  normal_branch_slot_4: string | null;
  normal_branch_slot_5: string | null;
  normal_branch_slot_6: string | null;

  legend_status_type_default: number;
  legend_status_type_branch: number;

  inagle_url: string | null;
  team: string[] | null;
  works_flags: WorksFlags | null;
  how_to_get: CharacterHowToGet[] | null;
  generation: string | null;
  school_year: string | null;
  character_role: string | null;

  created_at: string;
  updated_at: string;
};

export type StatusTypeRow = {
  id: number;
  name: string;
  rarity: string;
  image_url: string | null;
  kick: number | null;
  control: number | null;
  technique: number | null;
  pressure: number | null;
  physical: number | null;
  intelligence: number | null;
  agility: number | null;
  created_at: string;
  updated_at: string;
};

export type MinedSkillRow = {
  skill_id: string;
  name: string;
  name_ruby: string;
  type: string;
  option: string | null;
  element: string;
  number_of_people: number;
  foul_rate: number;
  description: string;
  tension_normal: number | null;
  power_normal: number | null;
  recast_normal: number | null;
  tension_mm: number | null;
  power_mm: number | null;
  recast_mm: number | null;
  tension_or: number | null;
  power_or: number | null;
  recast_or: number | null;
  tension_keshin: number | null;
  power_keshin: number | null;
  recast_keshin: number | null;
  tension_soul: number | null;
  power_soul: number | null;
  recast_soul: number | null;
  is_normal: boolean;
  is_mm: boolean;
  is_or: boolean;
  is_keshin: boolean;
  is_soul: boolean;
  aura_id: string | null;
  where_to_get: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type MinedAuraRow = {
  aura_id: string;
  name: string;
  name_ruby: string;
  type: string;
  category: string | null;
  element: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type MinedSkillVoiceRow = {
  id: number;
  character_id: string;
  skill_id: string;
  created_at: string;
  updated_at: string;
};

export type MinedAuraVoiceRow = {
  id: number;
  character_id: string;
  aura_id: string;
  created_at: string;
  updated_at: string;
};

export type MinedCharacterListView = {
  character_id: string;
  full_name: string;
  full_name_ruby: string;
  nickname: string;
  nickname_ruby: string;
  inagle_no: number | null;
  position: string;
  sub_position: string;
  element: string;
  physique: string;
  build_type: string;
  image_url: string;
  is_obtainable: boolean;

  default_shoot_at: number;
  default_focus_at: number;
  default_focus_df: number;
  default_scramble_at: number;
  default_scramble_df: number;
  default_wall_df: number;
  default_kp: number;

  branch_shoot_at: number;
  branch_focus_at: number;
  branch_focus_df: number;
  branch_scramble_at: number;
  branch_scramble_df: number;
  branch_wall_df: number;
  branch_kp: number;

  team: string | null;
  character_role: string | null;
};
