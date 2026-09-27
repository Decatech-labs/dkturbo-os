import type {
  AthleteId,
  DailyCheckin,
  DkturboUserId,
  WellnessScore,
} from '../domain/index.js';

export interface SaveDailyCheckinData {
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
}

export interface DailyCheckinRepository {
  findByAthleteAndDate(
    athleteId:
      AthleteId,

    date:
      string,
  ): Promise<DailyCheckin | null>;

  listByAthleteAndDateRange(
    athleteId:
      AthleteId,

    from:
      string,

    to:
      string,
  ): Promise<DailyCheckin[]>;

  save(
    data:
      SaveDailyCheckinData,
  ): Promise<DailyCheckin>;
}
