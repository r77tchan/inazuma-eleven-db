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
