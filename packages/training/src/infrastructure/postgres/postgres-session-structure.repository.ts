import type {
  Kysely,
} from 'kysely';

import type {
  AthleteId,
  DkturboUserId,
  ExerciseCatalogId,
  ExerciseCatalogItem,
  ExerciseCatalogOrigin,
  ExerciseMetricProfile,
  SessionBlock,
  SessionBlockId,
  SessionExercise,
  SessionExerciseId,
  TrainingSessionId,
  PerformanceEntry,
  PerformanceEntryId,
} from '../../domain/index.js';

import type {
  AddSessionExerciseData,
  CreateCustomExerciseData,
  CreateSessionBlockData,
  SessionStructureRepository,
  CreatePerformanceEntryData,
  UpdatePerformanceEntryActualData,
} from '../../ports/index.js';

import type {
  TrainingDatabase,
} from './database.js';

const mapBlock = (
  row: {
    id: string;
    session_id: string;
    athlete_id: string;
    position: number;
    title: string;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
  },
): SessionBlock => ({
  id:
    row.id as SessionBlockId,

  sessionId:
    row.session_id as TrainingSessionId,

  athleteId:
    row.athlete_id as AthleteId,

  position:
    row.position,

  title:
    row.title,

  notes:
    row.notes,

  createdAt:
    row.created_at,

  updatedAt:
    row.updated_at,
});

const mapExerciseCatalogItem = (
  row: {
    id: string;
    name: string;
    category: string | null;
    sport: string | null;
    metric_profile: string;
    origin: string;
    created_by_user_id: string | null;
    created_at: Date;
    updated_at: Date;
    archived_at: Date | null;
  },
): ExerciseCatalogItem => ({
  id:
    row.id as ExerciseCatalogId,

  name:
    row.name,

  category:
    row.category,

  sport:
    row.sport,

  metricProfile:
    row.metric_profile as ExerciseMetricProfile,

  origin:
    row.origin as ExerciseCatalogOrigin,

  createdByUserId:
    row.created_by_user_id === null
      ? null
      : row.created_by_user_id as DkturboUserId,

  createdAt:
    row.created_at,

  updatedAt:
    row.updated_at,

  archivedAt:
    row.archived_at,
});

const mapSessionExercise = (
  row: {
    id: string;
    block_id: string;
    session_id: string;
    athlete_id: string;
    exercise_id: string;
    position: number;
    planned_notes: string | null;
    actual_notes: string | null;
    created_at: Date;
    updated_at: Date;
  },
): SessionExercise => ({
  id:
    row.id as SessionExerciseId,

  blockId:
    row.block_id as SessionBlockId,

  sessionId:
    row.session_id as TrainingSessionId,

  athleteId:
    row.athlete_id as AthleteId,

  exerciseId:
    row.exercise_id as ExerciseCatalogId,

  position:
    row.position,

  plannedNotes:
    row.planned_notes,

  actualNotes:
    row.actual_notes,

  createdAt:
    row.created_at,

  updatedAt:
    row.updated_at,
});

const mapNumeric = (
  value:
    string | null,
): number | null =>
  value === null
    ? null
    : Number(value);

const toNumeric = (
  value:
    number | null,
): string | null =>
  value === null
    ? null
    : String(value);

const mapPerformanceEntry = (
  row: {
    id: string;
    session_exercise_id: string;
    athlete_id: string;
    position: number;
    planned_reps: number | null;
    actual_reps: number | null;
    planned_load_kg: string | null;
    actual_load_kg: string | null;
    planned_distance_m: string | null;
    actual_distance_m: string | null;
    planned_duration_ms: number | null;
    actual_duration_ms: number | null;
    planned_result_m: string | null;
    actual_result_m: string | null;
    planned_height_m: string | null;
    actual_height_m: string | null;
    planned_rpe: string | null;
    actual_rpe: string | null;
    planned_rir: string | null;
    actual_rir: string | null;
    planned_rest_seconds: number | null;
    actual_rest_seconds: number | null;
    actual_success: boolean | null;
    actual_is_foul: boolean | null;
    planned_metrics: Record<string, unknown>;
    actual_metrics: Record<string, unknown>;
    planned_notes: string | null;
    actual_notes: string | null;
    created_at: Date;
    updated_at: Date;
  },
): PerformanceEntry => ({
  id:
    row.id as PerformanceEntryId,

  sessionExerciseId:
    row.session_exercise_id as SessionExerciseId,

  athleteId:
    row.athlete_id as AthleteId,

  position:
    row.position,

  plannedReps:
    row.planned_reps,

  actualReps:
    row.actual_reps,

  plannedLoadKg:
    mapNumeric(
      row.planned_load_kg,
    ),

  actualLoadKg:
    mapNumeric(
      row.actual_load_kg,
    ),

  plannedDistanceM:
    mapNumeric(
      row.planned_distance_m,
    ),

  actualDistanceM:
    mapNumeric(
      row.actual_distance_m,
    ),

  plannedDurationMs:
    row.planned_duration_ms,

  actualDurationMs:
    row.actual_duration_ms,

  plannedResultM:
    mapNumeric(
      row.planned_result_m,
    ),

  actualResultM:
    mapNumeric(
      row.actual_result_m,
    ),

  plannedHeightM:
    mapNumeric(
      row.planned_height_m,
    ),

  actualHeightM:
    mapNumeric(
      row.actual_height_m,
    ),

  plannedRpe:
    mapNumeric(
      row.planned_rpe,
    ),

  actualRpe:
    mapNumeric(
      row.actual_rpe,
    ),

  plannedRir:
    mapNumeric(
      row.planned_rir,
    ),

  actualRir:
    mapNumeric(
      row.actual_rir,
    ),

  plannedRestSeconds:
    row.planned_rest_seconds,

  actualRestSeconds:
    row.actual_rest_seconds,

  actualSuccess:
    row.actual_success,

  actualIsFoul:
    row.actual_is_foul,

  plannedMetrics:
    row.planned_metrics,

  actualMetrics:
    row.actual_metrics,

  plannedNotes:
    row.planned_notes,

  actualNotes:
    row.actual_notes,

  createdAt:
    row.created_at,

  updatedAt:
    row.updated_at,
});

export class PostgresSessionStructureRepository
implements SessionStructureRepository {

  public constructor(
    private readonly db:
      Kysely<TrainingDatabase>,
  ) {}

  public async createBlock(
    data:
      CreateSessionBlockData,
  ): Promise<SessionBlock> {

    const row =
      await this.db
        .insertInto(
          'training.session_blocks',
        )
        .values({
          session_id:
            data.sessionId,

          athlete_id:
            data.athleteId,

          position:
            data.position,

          title:
            data.title,

          notes:
            data.notes,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapBlock(
      row,
    );
  }

  public async findBlockById(
    blockId:
      SessionBlockId,
  ): Promise<SessionBlock | null> {

    const row =
      await this.db
        .selectFrom(
          'training.session_blocks',
        )
        .selectAll()
        .where(
          'id',
          '=',
          blockId,
        )
        .executeTakeFirst();

    return row
      ? mapBlock(row)
      : null;
  }

  public async createCustomExercise(
    data:
      CreateCustomExerciseData,
  ): Promise<ExerciseCatalogItem> {

    const row =
      await this.db
        .insertInto(
          'training.exercise_catalog',
        )
        .values({
          name:
            data.name,

          category:
            data.category,

          sport:
            data.sport,

          metric_profile:
            data.metricProfile,

          origin:
            'CUSTOM',

          created_by_user_id:
            data.createdByUserId,

          archived_at:
            null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapExerciseCatalogItem(
      row,
    );
  }

  public async findExerciseById(
    exerciseId:
      ExerciseCatalogId,
  ): Promise<ExerciseCatalogItem | null> {

    const row =
      await this.db
        .selectFrom(
          'training.exercise_catalog',
        )
        .selectAll()
        .where(
          'id',
          '=',
          exerciseId,
        )
        .where(
          'archived_at',
          'is',
          null,
        )
        .executeTakeFirst();

    return row
      ? mapExerciseCatalogItem(
          row,
        )
      : null;
  }

  public async searchAvailableExercises(
    _userId:
      DkturboUserId,

    query:
      string,
  ): Promise<ExerciseCatalogItem[]> {

    const rows =
      await this.db
        .selectFrom(
          'training.exercise_catalog',
        )
        .selectAll()
        .where(
          'archived_at',
          'is',
          null,
        )
        .where(
          'name',
          'ilike',
          `%${query}%`,
        )
        .orderBy(
          'name',
          'asc',
        )
        .limit(
          50,
        )
        .execute();

    return rows.map(
      mapExerciseCatalogItem,
    );
  }

  public async addExercise(
    data:
      AddSessionExerciseData,
  ): Promise<SessionExercise> {

    const row =
      await this.db
        .insertInto(
          'training.session_exercises',
        )
        .values({
          block_id:
            data.blockId,

          session_id:
            data.sessionId,

          athlete_id:
            data.athleteId,

          exercise_id:
            data.exerciseId,

          position:
            data.position,

          planned_notes:
            data.plannedNotes,

          actual_notes:
            data.actualNotes,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapSessionExercise(
      row,
    );
  }

  public async listExercisesForBlock(
    blockId:
      SessionBlockId,
  ): Promise<SessionExercise[]> {

    const rows =
      await this.db
        .selectFrom(
          'training.session_exercises',
        )
        .selectAll()
        .where(
          'block_id',
          '=',
          blockId,
        )
        .orderBy(
          'position',
          'asc',
        )
        .execute();

    return rows.map(
      mapSessionExercise,
    );
  }

  public async findSessionExerciseById(
    sessionExerciseId:
      SessionExerciseId,
  ): Promise<SessionExercise | null> {

    const row =
      await this.db
        .selectFrom(
          'training.session_exercises',
        )
        .selectAll()
        .where(
          'id',
          '=',
          sessionExerciseId,
        )
        .executeTakeFirst();

    return row
      ? mapSessionExercise(
          row,
        )
      : null;
  }

  public async createPerformanceEntry(
    data:
      CreatePerformanceEntryData,
  ): Promise<PerformanceEntry> {

    const row =
      await this.db
        .insertInto(
          'training.performance_entries',
        )
        .values({
          session_exercise_id:
            data.sessionExerciseId,

          athlete_id:
            data.athleteId,

          position:
            data.position,

          planned_reps:
            data.plannedReps,

          actual_reps:
            data.actualReps,

          planned_load_kg:
            toNumeric(
              data.plannedLoadKg,
            ),

          actual_load_kg:
            toNumeric(
              data.actualLoadKg,
            ),

          planned_distance_m:
            toNumeric(
              data.plannedDistanceM,
            ),

          actual_distance_m:
            toNumeric(
              data.actualDistanceM,
            ),

          planned_duration_ms:
            data.plannedDurationMs,

          actual_duration_ms:
            data.actualDurationMs,

          planned_result_m:
            toNumeric(
              data.plannedResultM,
            ),

          actual_result_m:
            toNumeric(
              data.actualResultM,
            ),

          planned_height_m:
            toNumeric(
              data.plannedHeightM,
            ),

          actual_height_m:
            toNumeric(
              data.actualHeightM,
            ),

          planned_rpe:
            toNumeric(
              data.plannedRpe,
            ),

          actual_rpe:
            toNumeric(
              data.actualRpe,
            ),

          planned_rir:
            toNumeric(
              data.plannedRir,
            ),

          actual_rir:
            toNumeric(
              data.actualRir,
            ),

          planned_rest_seconds:
            data.plannedRestSeconds,

          actual_rest_seconds:
            data.actualRestSeconds,

          actual_success:
            data.actualSuccess,

          actual_is_foul:
            data.actualIsFoul,

          planned_metrics:
            {
              ...data.plannedMetrics,
            },

          actual_metrics:
            {
              ...data.actualMetrics,
            },

          planned_notes:
            data.plannedNotes,

          actual_notes:
            data.actualNotes,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapPerformanceEntry(
      row,
    );
  }

  public async listPerformanceEntries(
    sessionExerciseId:
      SessionExerciseId,
  ): Promise<PerformanceEntry[]> {

    const rows =
      await this.db
        .selectFrom(
          'training.performance_entries',
        )
        .selectAll()
        .where(
          'session_exercise_id',
          '=',
          sessionExerciseId,
        )
        .orderBy(
          'position',
          'asc',
        )
        .execute();

    return rows.map(
      mapPerformanceEntry,
    );
  }

  public async findPerformanceEntryById(
    performanceEntryId:
      PerformanceEntryId,
  ): Promise<PerformanceEntry | null> {

    const row =
      await this.db
        .selectFrom(
          'training.performance_entries',
        )
        .selectAll()
        .where(
          'id',
          '=',
          performanceEntryId,
        )
        .executeTakeFirst();

    return row
      ? mapPerformanceEntry(
          row,
        )
      : null;
  }

  public async updatePerformanceEntryActual(
    data:
      UpdatePerformanceEntryActualData,
  ): Promise<PerformanceEntry> {

    const row =
      await this.db
        .updateTable(
          'training.performance_entries',
        )
        .set({
          actual_reps:
            data.actualReps,

          actual_load_kg:
            toNumeric(
              data.actualLoadKg,
            ),

          actual_distance_m:
            toNumeric(
              data.actualDistanceM,
            ),

          actual_duration_ms:
            data.actualDurationMs,

          actual_result_m:
            toNumeric(
              data.actualResultM,
            ),

          actual_height_m:
            toNumeric(
              data.actualHeightM,
            ),

          actual_rpe:
            toNumeric(
              data.actualRpe,
            ),

          actual_rir:
            toNumeric(
              data.actualRir,
            ),

          actual_rest_seconds:
            data.actualRestSeconds,

          actual_success:
            data.actualSuccess,

          actual_is_foul:
            data.actualIsFoul,

          actual_metrics:
            {
              ...data.actualMetrics,
            },

          actual_notes:
            data.actualNotes,

          updated_at:
            new Date(),
        })
        .where(
          'id',
          '=',
          data.performanceEntryId,
        )
        .where(
          'athlete_id',
          '=',
          data.athleteId,
        )
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapPerformanceEntry(
      row,
    );
  }
}
