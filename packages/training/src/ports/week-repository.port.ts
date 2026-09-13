import type {
  AthleteId,
  DkturboUserId,
  TrainingDay,
  TrainingDayId,
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

export interface UpdateWeekData {
  weekId:
    TrainingWeekId;

  athleteId:
    AthleteId;

  title:
    string | null;

  notes:
    string | null;
}

export interface WeekRepository {
  createWeek(
    data: CreateWeekData,
  ): Promise<TrainingWeek>;

  updateWeek(
    data:
      UpdateWeekData,
  ): Promise<TrainingWeek | null>;

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

  listForAthlete(
    athleteId:
      AthleteId,
  ): Promise<TrainingWeek[]>;

  findDayById(
    dayId: TrainingDayId,
  ): Promise<TrainingDay | null>;

  listDaysForWeek(
    weekId: TrainingWeekId,
  ): Promise<TrainingDay[]>;
}
