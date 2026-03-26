export type ScrapingResult = {
  characterDetailList: CharacterDetail[];
  totalListCount: number;
  fetchedAt: string;
};

export type CharacterUrl = {
  detailUrl: string;
  characterNo: string;
};

export type CharacterName = {
  name: string;
  ruby: string;
};

export type CharacterDetail = {
  detailUrl: string;
  characterNo: string;
  nickname: CharacterName[];
  fullName: CharacterName[];
  imageUrl: string;
  works: string;
  description: string;
  position: string;
  element: string;
  kick: string;
  control: string;
  technique: string;
  pressure: string;
  physical: string;
  agility: string;
  intelligence: string;
  generation: string;
  schoolYear: string;
  gender: string;
  characterRole: string;
  fetchedAt: string;
};

export type ScrapedCharacterDetailRow = {
  character_no: number | null;
  detail_url: string;
  nickname: CharacterName[];
  full_name: CharacterName[];
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
  created_at: string;
  updated_at: string;
};
