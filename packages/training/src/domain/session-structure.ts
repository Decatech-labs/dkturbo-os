import type {
  AthleteId,
  DkturboUserId,
} from './athlete.js';

import type {
  TrainingSessionId,
} from './session.js';

declare const sessionBlockIdBrand:
  unique symbol;

export type SessionBlockId =
  string & {
    readonly [
      sessionBlockIdBrand
    ]: true;
  };

declare const exerciseCatalogIdBrand:
  unique symbol;

export type ExerciseCatalogId =
  string & {
    readonly [
      exerciseCatalogIdBrand
    ]: true;
  };

declare const sessionExerciseIdBrand:
  unique symbol;

export type SessionExerciseId =
  string & {
    readonly [
      sessionExerciseIdBrand
    ]: true;
  };

declare const performanceEntryIdBrand:
  unique symbol;

export type PerformanceEntryId =
  string & {
    readonly [
      performanceEntryIdBrand
    ]: true;
  };

export type ExerciseMetricProfile =
  | 'STRENGTH'
  | 'INTERVAL'
  | 'CONTINUOUS'
  | 'ATTEMPT_DISTANCE'
  | 'ATTEMPT_HEIGHT'
  | 'REHAB'
  | 'GENERIC';

export type ExerciseCatalogOrigin =
  | 'SYSTEM'
  | 'CUSTOM';

export interface SessionBlock {
  id:
    SessionBlockId;

  sessionId:
    TrainingSessionId;

  athleteId:
    AthleteId;

  position:
    number;

  title:
    string;

  notes:
    string | null;

  createdAt:
    Date;

  updatedAt:
    Date;
}

export interface ExerciseCatalogItem {
  id:
    ExerciseCatalogId;

  name:
    string;

  category:
    string | null;

  sport:
    string | null;

  metricProfile:
    ExerciseMetricProfile;

  origin:
    ExerciseCatalogOrigin;

  createdByUserId:
    DkturboUserId | null;

  createdAt:
    Date;

  updatedAt:
    Date;

  archivedAt:
    Date | null;
}

export interface SessionExercise {
  id:
    SessionExerciseId;

  blockId:
    SessionBlockId;

  sessionId:
    TrainingSessionId;

  athleteId:
    AthleteId;

  exerciseId:
    ExerciseCatalogId;

  position:
    number;

  plannedNotes:
    string | null;

  actualNotes:
    string | null;

  createdAt:
    Date;

  updatedAt:
    Date;
}

export interface PerformanceEntry {
  id:
    PerformanceEntryId;

  sessionExerciseId:
    SessionExerciseId;

  athleteId:
    AthleteId;

  position:
    number;

  plannedReps:
    number | null;

  actualReps:
    number | null;

  plannedLoadKg:
    number | null;

  actualLoadKg:
    number | null;

  plannedDistanceM:
    number | null;

  actualDistanceM:
    number | null;

  plannedDurationMs:
    number | null;

  actualDurationMs:
    number | null;

  plannedResultM:
    number | null;

  actualResultM:
    number | null;

  plannedHeightM:
    number | null;

  actualHeightM:
    number | null;

  plannedRpe:
    number | null;

  actualRpe:
    number | null;

  plannedRir:
    number | null;

  actualRir:
    number | null;

  plannedRestSeconds:
    number | null;

  actualRestSeconds:
    number | null;

  actualSuccess:
    boolean | null;

  actualIsFoul:
    boolean | null;

  plannedMetrics:
    Readonly<
      Record<
        string,
        unknown
      >
    >;

  actualMetrics:
    Readonly<
      Record<
        string,
        unknown
      >
    >;

  plannedNotes:
    string | null;

  actualNotes:
    string | null;

  createdAt:
    Date;

  updatedAt:
    Date;
}
