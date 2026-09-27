import {
  cookies,
} from 'next/headers';

const API_BASE_URL =
  (
    process.env.DKTURBO_API_URL ??
    'http://127.0.0.1:3001'
  ).replace(
    /\/$/,
    '',
  );

export interface TrainingAthleteResponse {
  id:
    string;

  displayName:
    string;

  createdAt:
    string;

  updatedAt:
    string;
}

export type TrainingAccessRole =
  | 'SELF'
  | 'COACH'
  | 'VIEWER';

export interface AccessibleTrainingAthleteResponse {
  athlete:
    TrainingAthleteResponse;

  accessRole:
    TrainingAccessRole;

  canWrite:
    boolean;
}

export interface TrainingWeekResponse {
  id:
    string;

  athleteId:
    string;

  weekStart:
    string;

  status:
    | 'DRAFT'
    | 'PLANNED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'SUBMITTED'
    | 'CLOSED';

  title:
    string | null;

  notes:
    string | null;

  createdByUserId:
    string;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface AccessibleTrainingWeekResponse {
  week:
    TrainingWeekResponse;

  accessRole:
    TrainingAccessRole;

  canWrite:
    boolean;
}

export interface TrainingDayResponse {
  id:
    string;

  weekId:
    string;

  athleteId:
    string;

  date:
    string;

  notes:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface TrainingSessionResponse {
  id:
    string;

  dayId:
    string;

  athleteId:
    string;

  type:
    string;

  title:
    string;

  plannedStartTime:
    string | null;

  plannedDurationMinutes:
    number | null;

  actualStartTime:
    string | null;

  actualDurationMinutes:
    number | null;

  status:
    string;

  plannedNotes:
    string | null;

  actualNotes:
    string | null;

  plannedRpe:
    number | null;

  actualRpe:
    number | null;

  source:
    string;

  externalId:
    string | null;

  createdByUserId:
    string;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface TrainingWeekDetailDayResponse {
  day:
    TrainingDayResponse;

  sessions:
    TrainingSessionResponse[];
}

export interface TrainingWeekDetailResponse {
  week:
    TrainingWeekResponse;

  accessRole:
    TrainingAccessRole;

  canWrite:
    boolean;

  days:
    TrainingWeekDetailDayResponse[];
}

export type TrainingWellnessScore =
  | 1
  | 2
  | 3
  | 4
  | 5;

export interface TrainingDailyCheckinResponse {
  id:
    string;

  athleteId:
    string;

  date:
    string;

  weightKg:
    number | null;

  sleepQuality:
    TrainingWellnessScore | null;

  fatigue:
    TrainingWellnessScore | null;

  soreness:
    TrainingWellnessScore | null;

  stress:
    TrainingWellnessScore | null;

  motivation:
    TrainingWellnessScore | null;

  notes:
    string | null;

  recordedByUserId:
    string;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface TrainingDailyCheckinWeightSummary {
  first:
    number | null;

  last:
    number | null;

  average:
    number | null;

  difference:
    number | null;
}

export interface TrainingDailyCheckinAverages {
  sleepQuality:
    number | null;

  fatigue:
    number | null;

  soreness:
    number | null;

  stress:
    number | null;

  motivation:
    number | null;
}

export interface TrainingDailyCheckinRangeSummary {
  from:
    string;

  to:
    string;

  recordedDays:
    number;

  periodDays:
    number;

  weight:
    TrainingDailyCheckinWeightSummary;

  averages:
    TrainingDailyCheckinAverages;
}

export interface TrainingDailyCheckinRangeResponse {
  checkins:
    TrainingDailyCheckinResponse[];

  summary:
    TrainingDailyCheckinRangeSummary;
}

export class TrainingApiError
extends Error {

  public constructor(
    public readonly status:
      number,

    public readonly path:
      string,
  ) {
    super(
      `Training API request failed: ${status} ${path}`,
    );

    this.name =
      'TrainingApiError';
  }
}

const getCookieHeader =
  async (): Promise<string> => {

    const cookieStore =
      await cookies();

    return cookieStore
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join('; ');
  };

const getTrainingJson =
  async <T>(
    path:
      string,
  ): Promise<T> => {

    const cookie =
      await getCookieHeader();

    const response =
      await fetch(
        `${API_BASE_URL}${path}`,
        {
          headers: {
            cookie,
          },

          cache:
            'no-store',
        },
      );

    if (!response.ok) {
      throw new TrainingApiError(
        response.status,
        path,
      );
    }

    return response.json() as
      Promise<T>;
  };

export const getTrainingAthletes =
  (): Promise<
    AccessibleTrainingAthleteResponse[]
  > =>
    getTrainingJson(
      '/api/training/athletes',
    );

export const getTrainingWeeks =
  (
    athleteId:
      string,
  ): Promise<
    AccessibleTrainingWeekResponse[]
  > =>
    getTrainingJson(
      `/api/training/athletes/${encodeURIComponent(
        athleteId,
      )}/weeks`,
    );

export const getTrainingWeekDetail =
  (
    athleteId:
      string,

    weekId:
      string,
  ): Promise<
    TrainingWeekDetailResponse
  > =>
    getTrainingJson(
      `/api/training/athletes/${encodeURIComponent(
        athleteId,
      )}/weeks/${encodeURIComponent(
        weekId,
      )}`,
    );

export const getTrainingDailyCheckinRange =
  (
    athleteId:
      string,

    from:
      string,

    to:
      string,
  ): Promise<
    TrainingDailyCheckinRangeResponse
  > =>
    getTrainingJson(
      `/api/training/athletes/${encodeURIComponent(
        athleteId,
      )}/daily-checkins?from=${encodeURIComponent(
        from,
      )}&to=${encodeURIComponent(
        to,
      )}`,
    );

export const getTrainingSessionDetail =
  (
    athleteId:
      string,

    sessionId:
      string,
  ): Promise<
    TrainingSessionDetailResponse
  > =>
    getTrainingJson(
      `/api/training/athletes/${encodeURIComponent(
        athleteId,
      )}/sessions/${encodeURIComponent(
        sessionId,
      )}`,
    );

export interface TrainingSessionBlockResponse {
  id: string;
  athleteId: string;
  sessionId: string;
  position: number;
  title: string | null;
  notes: string | null;
}

export interface TrainingExerciseCatalogItemResponse {
  id: string;
  name: string;
  metricProfile:
  | 'STRENGTH'
  | 'INTERVAL'
  | 'CONTINUOUS'
  | 'ATTEMPT_DISTANCE'
  | 'ATTEMPT_HEIGHT'
  | 'REHAB'
  | 'GENERIC';
  origin: 'SYSTEM' | 'CUSTOM';
  createdByUserId: string | null;
}

export interface TrainingSessionExerciseResponse {
  id: string;
  athleteId: string;
  sessionId: string;
  blockId: string;
  exerciseId: string;
  position: number;
  plannedNotes: string | null;
  actualNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingPerformanceEntryResponse {
  id: string;
  athleteId: string;
  sessionExerciseId: string;
  position: number;

  plannedReps: number | null;
  actualReps: number | null;

  plannedLoadKg: number | null;
  actualLoadKg: number | null;

  plannedDistanceM: number | null;
  actualDistanceM: number | null;

  plannedDurationMs: number | null;
  actualDurationMs: number | null;

  plannedResultM: number | null;
  actualResultM: number | null;

  plannedHeightM: number | null;
  actualHeightM: number | null;

  plannedRpe: number | null;
  actualRpe: number | null;

  plannedRir: number | null;
  actualRir: number | null;

  plannedRestSeconds: number | null;
  actualRestSeconds: number | null;

  actualSuccess: boolean | null;
  actualIsFoul: boolean | null;

  plannedMetrics: Record<
    string,
    unknown
  >;

  actualMetrics: Record<
    string,
    unknown
  >;

  plannedNotes: string | null;
  actualNotes: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface TrainingSessionDetailExerciseResponse {
  sessionExercise: TrainingSessionExerciseResponse;
  catalogItem: TrainingExerciseCatalogItemResponse;
  performanceEntries: TrainingPerformanceEntryResponse[];
}

export interface TrainingSessionDetailBlockResponse {
  block: TrainingSessionBlockResponse;
  exercises: TrainingSessionDetailExerciseResponse[];
}

export interface TrainingSessionDetailResponse {
  session: TrainingSessionResponse;
  accessRole: TrainingAccessRole;
  canWrite: boolean;
  blocks: TrainingSessionDetailBlockResponse[];
}