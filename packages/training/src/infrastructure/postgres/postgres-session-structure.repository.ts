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
  SearchAvailableExercisesFilters,
  UpdatePerformanceEntryPlannedData,
  UpdateSessionBlockData,
  SessionExerciseLayoutBlock,
  UpdateSessionExercisePlannedData,
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

    public async updateBlock(

    data:
      UpdateSessionBlockData,

  ): Promise<SessionBlock> {

    const row =

      await this.db

        .updateTable(
          'training.session_blocks',
        )

        .set({

          title:
            data.title,

          notes:
            data.notes,

          updated_at:
            new Date(),

        })

        .where(
          'id',
          '=',
          data.blockId,
        )

        .where(
          'athlete_id',
          '=',
          data.athleteId,
        )

        .returningAll()

        .executeTakeFirstOrThrow();

    return mapBlock(
      row,
    );

  }

  public async deleteBlock(

    blockId:
      SessionBlockId,

    athleteId:
      AthleteId,

  ): Promise<boolean> {

    const result =

      await this.db

        .deleteFrom(
          'training.session_blocks',
        )

        .where(
          'id',
          '=',
          blockId,
        )

        .where(
          'athlete_id',
          '=',
          athleteId,
        )

        .executeTakeFirst();

    return (
      Number(
        result.numDeletedRows,
      ) >
      0
    );

  }

  public async reorderBlocks(

    sessionId:
      TrainingSessionId,

    athleteId:
      AthleteId,

    orderedIds:
      readonly SessionBlockId[],

  ): Promise<SessionBlock[]> {

    if (
      orderedIds.length ===
      0
    ) {
      return [];
    }

    const currentRows =

      await this.db

        .selectFrom(
          'training.session_blocks',
        )

        .select([
          'id',
          'position',
        ])

        .where(
          'session_id',
          '=',
          sessionId,
        )

        .where(
          'athlete_id',
          '=',
          athleteId,
        )

        .orderBy(
          'position',
          'asc',
        )

        .execute();

    const maxPosition =

      currentRows.reduce(

        (
          currentMax,
          row,
        ) =>
          Math.max(
            currentMax,
            row.position,
          ),

        -1,

      );

    const temporaryBase =

      maxPosition +
      orderedIds.length +
      1000;

    for (
      let index = 0;
      index <
      orderedIds.length;
      index += 1
    ) {

      const id =
        orderedIds[index];

      if (!id) {
        continue;
      }

      await this.db

        .updateTable(
          'training.session_blocks',
        )

        .set({

          position:
            temporaryBase +
            index,

          updated_at:
            new Date(),

        })

        .where(
          'id',
          '=',
          id,
        )

        .where(
          'session_id',
          '=',
          sessionId,
        )

        .where(
          'athlete_id',
          '=',
          athleteId,
        )

        .execute();

    }

    for (
      let index = 0;
      index <
      orderedIds.length;
      index += 1
    ) {

      const id =
        orderedIds[index];

      if (!id) {
        continue;
      }

      await this.db

        .updateTable(
          'training.session_blocks',
        )

        .set({

          position:
            index,

          updated_at:
            new Date(),

        })

        .where(
          'id',
          '=',
          id,
        )

        .where(
          'session_id',
          '=',
          sessionId,
        )

        .where(
          'athlete_id',
          '=',
          athleteId,
        )

        .execute();

    }

    return this.listBlocksForSession(
      sessionId,
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

    filters:
      SearchAvailableExercisesFilters = {},
  ): Promise<ExerciseCatalogItem[]> {
    let statement =
      this.db
        .selectFrom(
          'training.exercise_catalog',
        )
        .selectAll()
        .where(
          'archived_at',
          'is',
          null,
        );

    const normalizedQuery =
      query.trim();

    if (normalizedQuery) {
      statement =
        statement.where(
          'name',
          'ilike',
          `%${normalizedQuery}%`,
        );
    }

    if (
      filters.metricProfile
    ) {
      statement =
        statement.where(
          'metric_profile',
          '=',
          filters.metricProfile,
        );
    }

    if (
      filters.origin
    ) {
      statement =
        statement.where(
          'origin',
          '=',
          filters.origin,
        );
    }

    const normalizedSport =
      filters.sport
        ?.trim();

    if (normalizedSport) {
      statement =
        statement.where(
          'sport',
          'ilike',
          `%${normalizedSport}%`,
        );
    }

    const rows =
      await statement
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

    public async updateSessionExercisePlanned(

    data:
      UpdateSessionExercisePlannedData,

  ): Promise<SessionExercise> {

    const row =

      await this.db

        .updateTable(
          'training.session_exercises',
        )

        .set({

          planned_notes:
            data.plannedNotes,

          updated_at:
            new Date(),

        })

        .where(
          'id',
          '=',
          data.sessionExerciseId,
        )

        .where(
          'athlete_id',
          '=',
          data.athleteId,
        )

        .returningAll()

        .executeTakeFirstOrThrow();

    return mapSessionExercise(
      row,
    );

  }

  public async deleteSessionExercise(

    sessionExerciseId:
      SessionExerciseId,

    athleteId:
      AthleteId,

  ): Promise<boolean> {

    const result =

      await this.db

        .deleteFrom(
          'training.session_exercises',
        )

        .where(
          'id',
          '=',
          sessionExerciseId,
        )

        .where(
          'athlete_id',
          '=',
          athleteId,
        )

        .executeTakeFirst();

    return (
      Number(
        result.numDeletedRows,
      ) > 0
    );

  }

  public async applySessionExerciseLayout(

    sessionId:
      TrainingSessionId,

    athleteId:
      AthleteId,

    blocks:
      readonly SessionExerciseLayoutBlock[],

  ): Promise<SessionExercise[]> {

    const currentRows =

      await this.db

        .selectFrom(
          'training.session_exercises',
        )

        .select([
          'id',
          'position',
        ])

        .where(
          'session_id',
          '=',
          sessionId,
        )

        .where(
          'athlete_id',
          '=',
          athleteId,
        )

        .execute();

    const maxPosition =

      currentRows.reduce(

        (
          maximum,
          row,
        ) =>
          Math.max(
            maximum,
            row.position,
          ),

        -1,

      );

    const totalExercises =

      blocks.reduce(

        (
          total,
          block,
        ) =>
          total +
          block.orderedIds.length,

        0,

      );

    const temporaryBase =

      maxPosition +
      totalExercises +
      1000;

    let temporaryOffset =
      0;

    /*
     * First move every exercise to a collision-free
     * temporary position while keeping its current block.
     */
    for (
      const block of
      blocks
    ) {

      for (
        const id of
        block.orderedIds
      ) {

        await this.db

          .updateTable(
            'training.session_exercises',
          )

          .set({

            position:
              temporaryBase +
              temporaryOffset,

            updated_at:
              new Date(),

          })

          .where(
            'id',
            '=',
            id,
          )

          .where(
            'session_id',
            '=',
            sessionId,
          )

          .where(
            'athlete_id',
            '=',
            athleteId,
          )

          .execute();

        temporaryOffset +=
          1;

      }

    }

    /*
     * Then assign the definitive block and position.
     */
    for (
      const block of
      blocks
    ) {

      for (
        let position = 0;
        position <
        block.orderedIds.length;
        position += 1
      ) {

        const id =
          block.orderedIds[
            position
          ];

        if (!id) {
          continue;
        }

        await this.db

          .updateTable(
            'training.session_exercises',
          )

          .set({

            block_id:
              block.blockId,

            position,

            updated_at:
              new Date(),

          })

          .where(
            'id',
            '=',
            id,
          )

          .where(
            'session_id',
            '=',
            sessionId,
          )

          .where(
            'athlete_id',
            '=',
            athleteId,
          )

          .execute();

      }

    }

    const rows =

      await this.db

        .selectFrom(
          'training.session_exercises',
        )

        .selectAll()

        .where(
          'session_id',
          '=',
          sessionId,
        )

        .where(
          'athlete_id',
          '=',
          athleteId,
        )

        .orderBy(
          'block_id',
          'asc',
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

  public async updatePerformanceEntryPlanned(
    data:
      UpdatePerformanceEntryPlannedData,
  ): Promise<PerformanceEntry> {

    const row =
      await this.db
        .updateTable(
          'training.performance_entries',
        )
        .set({
          planned_reps:
            data.plannedReps,

          planned_load_kg:
            toNumeric(
              data.plannedLoadKg,
            ),

          planned_distance_m:
            toNumeric(
              data.plannedDistanceM,
            ),

          planned_duration_ms:
            data.plannedDurationMs,

          planned_result_m:
            toNumeric(
              data.plannedResultM,
            ),

          planned_height_m:
            toNumeric(
              data.plannedHeightM,
            ),

          planned_rpe:
            toNumeric(
              data.plannedRpe,
            ),

          planned_rir:
            toNumeric(
              data.plannedRir,
            ),

          planned_rest_seconds:
            data.plannedRestSeconds,

          planned_metrics: {
            ...data.plannedMetrics,
          },

          planned_notes:
            data.plannedNotes,

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

  public async deletePerformanceEntry(
    performanceEntryId:
      PerformanceEntryId,

    athleteId:
      AthleteId,
  ): Promise<boolean> {

    const result =
      await this.db
        .deleteFrom(
          'training.performance_entries',
        )
        .where(
          'id',
          '=',
          performanceEntryId,
        )
        .where(
          'athlete_id',
          '=',
          athleteId,
        )
        .executeTakeFirst();

    return Number(
      result.numDeletedRows,
    ) > 0;
  }

    public async reorderPerformanceEntries(

    sessionExerciseId:
      SessionExerciseId,

    athleteId:
      AthleteId,

    orderedIds:
      readonly PerformanceEntryId[],

  ): Promise<PerformanceEntry[]> {

    if (
      orderedIds.length ===
      0
    ) {
      return [];
    }

    const currentRows =
      await this.db

        .selectFrom(
          'training.performance_entries',
        )

        .select([
          'id',
          'position',
        ])

        .where(
          'session_exercise_id',
          '=',
          sessionExerciseId,
        )

        .where(
          'athlete_id',
          '=',
          athleteId,
        )

        .orderBy(
          'position',
          'asc',
        )

        .execute();

    const maxPosition =
      currentRows.reduce(
        (
          currentMax,
          row,
        ) =>
          Math.max(
            currentMax,
            row.position,
          ),
        -1,
      );

    const temporaryBase =
      maxPosition +
      orderedIds.length +
      1000;

    for (
      let index = 0;
      index <
      orderedIds.length;
      index += 1
    ) {
      const id =
        orderedIds[
          index
        ];

      if (!id) {
        continue;
      }

      await this.db

        .updateTable(
          'training.performance_entries',
        )

        .set({
          position:
            temporaryBase +
            index,

          updated_at:
            new Date(),
        })

        .where(
          'id',
          '=',
          id,
        )

        .where(
          'session_exercise_id',
          '=',
          sessionExerciseId,
        )

        .where(
          'athlete_id',
          '=',
          athleteId,
        )

        .execute();
    }

    for (
      let index = 0;
      index <
      orderedIds.length;
      index += 1
    ) {
      const id =
        orderedIds[
          index
        ];

      if (!id) {
        continue;
      }

      await this.db

        .updateTable(
          'training.performance_entries',
        )

        .set({
          position:
            index,

          updated_at:
            new Date(),
        })

        .where(
          'id',
          '=',
          id,
        )

        .where(
          'session_exercise_id',
          '=',
          sessionExerciseId,
        )

        .where(
          'athlete_id',
          '=',
          athleteId,
        )

        .execute();
    }

    return this.listPerformanceEntries(
      sessionExerciseId,
    );
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

  public async listBlocksForSession(
    sessionId:
      TrainingSessionId,
  ): Promise<SessionBlock[]> {

    const rows =
      await this.db
        .selectFrom(
          'training.session_blocks',
        )
        .selectAll()
        .where(
          'session_id',
          '=',
          sessionId,
        )
        .orderBy(
          'position',
          'asc',
        )
        .execute();

    return rows.map(
      mapBlock,
    );
  }
}
