import type {
  AthleteId,
  DkturboUserId,
  TrainingDay,
  TrainingWeek,
  TrainingWeekId,
} from '../domain/index.js';

export interface CreateWeekData {
  athleteId:
    AthleteId;

  weekStart:
    string;

  title?:
    string | null;

  notes?:
    string | null;

  createdByUserId:
    DkturboUserId;
}

export interface CreateDayData {
  weekId:
    TrainingWeekId;

  athleteId:
    AthleteId;

  date:
    string;

  notes?:
    string | null;
}

export interface WeekRepository {
  createWeek(
    data: CreateWeekData,
  ): Promise<TrainingWeek>;

  createDay(
    data: CreateDayData,
  ): Promise<TrainingDay>;

  findWeekById(
    weekId: TrainingWeekId,
  ): Promise<TrainingWeek | null>;

  findWeekByAthleteAndStart(
    athleteId: AthleteId,
    weekStart: string,
  ): Promise<TrainingWeek | null>;

  listDaysForWeek(
    weekId: TrainingWeekId,
  ): Promise<TrainingDay[]>;
}
