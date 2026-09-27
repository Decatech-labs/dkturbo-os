import type {
  AthleteId,
  DkturboUserId,
} from './athlete.js';

export type DailyCheckinId =
  string & {
    readonly __brand:
      'DailyCheckinId';
  };

export type WellnessScore =
  | 1
  | 2
  | 3
  | 4
  | 5;

export interface DailyCheckin {
  id:
    DailyCheckinId;

  athleteId:
    AthleteId;

  date:
    string;

  weightKg:
    number | null;

  sleepQuality:
    WellnessScore | null;

  fatigue:
    WellnessScore | null;

  soreness:
    WellnessScore | null;

  stress:
    WellnessScore | null;

  motivation:
    WellnessScore | null;

  notes:
    string | null;

  recordedByUserId:
    DkturboUserId;

  createdAt:
    Date;

  updatedAt:
    Date;
}
