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
} from '../../domain/index.js';

import type {
  AddSessionExerciseData,
  CreateCustomExerciseData,
  CreateSessionBlockData,
  SessionStructureRepository,
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
}
