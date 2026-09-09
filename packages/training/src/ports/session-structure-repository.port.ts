import type {
  AthleteId,
  DkturboUserId,
  ExerciseCatalogId,
  ExerciseCatalogItem,
  ExerciseMetricProfile,
  PerformanceEntry,
  SessionBlock,
  SessionBlockId,
  SessionExercise,
  SessionExerciseId,
  TrainingSessionId,
} from '../domain/index.js';

export interface CreateSessionBlockData {
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
}

export interface CreateCustomExerciseData {
  name:
    string;

  category:
    string | null;

  sport:
    string | null;

  metricProfile:
    ExerciseMetricProfile;

  createdByUserId:
    DkturboUserId;
}

export interface AddSessionExerciseData {
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
}

export interface CreatePerformanceEntryData {
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
}

export interface UpdatePerformanceEntryActualData {
  performanceEntryId:
    PerformanceEntry['id'];

  athleteId:
    AthleteId;

  actualReps:
    number | null;

  actualLoadKg:
    number | null;

  actualDistanceM:
    number | null;

  actualDurationMs:
    number | null;

  actualResultM:
    number | null;

  actualHeightM:
    number | null;

  actualRpe:
    number | null;

  actualRir:
    number | null;

  actualRestSeconds:
    number | null;

  actualSuccess:
    boolean | null;

  actualIsFoul:
    boolean | null;

  actualMetrics:
    Readonly<
      Record<
        string,
        unknown
      >
    >;

  actualNotes:
    string | null;
}

export interface SessionStructureRepository {
  createBlock(
    data:
      CreateSessionBlockData,
  ): Promise<SessionBlock>;

  findBlockById(
    blockId:
      SessionBlockId,
  ): Promise<SessionBlock | null>;

  listBlocksForSession(
    sessionId:
      TrainingSessionId,
  ): Promise<SessionBlock[]>;

  createCustomExercise(
    data:
      CreateCustomExerciseData,
  ): Promise<ExerciseCatalogItem>;

  findExerciseById(
    exerciseId:
      ExerciseCatalogId,
  ): Promise<ExerciseCatalogItem | null>;

  searchAvailableExercises(
    userId:
      DkturboUserId,

    query:
      string,
  ): Promise<ExerciseCatalogItem[]>;

  addExercise(
    data:
      AddSessionExerciseData,
  ): Promise<SessionExercise>;

  findSessionExerciseById(
    sessionExerciseId:
      SessionExerciseId,
  ): Promise<SessionExercise | null>;

  listExercisesForBlock(
    blockId:
      SessionBlockId,
  ): Promise<SessionExercise[]>;

  createPerformanceEntry(
    data:
      CreatePerformanceEntryData,
  ): Promise<PerformanceEntry>;

  listPerformanceEntries(
    sessionExerciseId:
      SessionExerciseId,
  ): Promise<PerformanceEntry[]>;

  findPerformanceEntryById(
    performanceEntryId:
      PerformanceEntry['id'],
  ): Promise<PerformanceEntry | null>;

  updatePerformanceEntryActual(
    data:
      UpdatePerformanceEntryActualData,
  ): Promise<PerformanceEntry>;
}
