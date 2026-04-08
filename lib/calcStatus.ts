export type StatusInput = {
  kick: number;
  control: number;
  technique: number;
  pressure: number;
  physical: number;
  intelligence: number;
  agility: number;
};

export type CalcStatusResult = {
  shoot_at: number;
  focus_at: number;
  focus_df: number;
  scramble_at: number;
  scramble_df: number;
  wall_df: number;
  kp: number;
};

/*
  shoot_at     = kick + control
  focus_at     = technique + control + (kick / 2)
  focus_df     = technique + intelligence + (agility / 2)
  scramble_at  = intelligence + physical
  scramble_df  = intelligence + pressure
  wall_df      = physical + pressure
  kp           = (agility * 4) + (physical * 3) + (pressure * 2)
*/
export function calcStatus(stats: StatusInput): CalcStatusResult {
  const {
    kick,
    control,
    technique,
    pressure,
    physical,
    intelligence,
    agility,
  } = stats;

  return {
    shoot_at: kick + control,
    focus_at: technique + control + kick / 2,
    focus_df: technique + intelligence + agility / 2,
    scramble_at: intelligence + physical,
    scramble_df: intelligence + pressure,
    wall_df: physical + pressure,
    kp: agility * 4 + physical * 3 + pressure * 2,
  };
}
