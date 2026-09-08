import type {
  AthleteId,
  DkturboUserId,
  ExerciseCatalogId,
  ExerciseCatalogItem,
  ExerciseMetricProfile,
  SessionBlock,
  SessionBlockId,
  SessionExercise,
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

export interface SessionStructureRepository {
  createBlock(
    data:
      CreateSessionBlockData,
  ): Promise<SessionBlock>;

  findBlockById(
    blockId:
      SessionBlockId,
  ): Promise<SessionBlock | null>;

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

  listExercisesForBlock(
    blockId:
      SessionBlockId,
  ): Promise<SessionExercise[]>;
}
