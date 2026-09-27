import type {
  Kysely,
} from 'kysely';

import type {
  AthleteId,
  DkturboUserId,
  TrainingDayId,
  TrainingSession,
  TrainingSessionId,
  TrainingSessionStatus,
  TrainingSessionType,
} from '../../domain/index.js';

import type {
  CreatePlannedSessionData,
  SessionRepository,
  UpdatePlannedSessionData,
} from '../../ports/index.js';

import type {
  TrainingDatabase,
} from './database.js';

const mapNumeric =
  (
    value:
      string | null,
  ): number | null =>
    value === null
      ? null
      : Number(value);

const mapTimeOnly =
  (
    value:
      string | null,
  ): string | null => {

    if (value === null) {
      return null;
    }

    return value.slice(
      0,
      5,
    );
  };

const mapSession = (
  row: {
    id: string;
    day_id: string;
    athlete_id: string;
    type: string;
    title: string;
    planned_start_time: string | null;
    planned_duration_minutes: number | null;
    actual_start_time: string | null;
    actual_duration_minutes: number | null;
    status: string;
    planned_notes: string | null;
    actual_notes: string | null;
    planned_rpe: string | null;
    actual_rpe: string | null;
    source: string;
    external_id: string | null;
    created_by_user_id: string;
    created_at: Date;
    updated_at: Date;
  },
): TrainingSession => ({
  id:
    row.id as TrainingSessionId,

  dayId:
    row.day_id as TrainingDayId,

  athleteId:
    row.athlete_id as AthleteId,

  type:
    row.type as TrainingSessionType,

  title:
    row.title,

  plannedStartTime:
    mapTimeOnly(
      row.planned_start_time,
    ),

  plannedDurationMinutes:
    row.planned_duration_minutes,

  actualStartTime:
    mapTimeOnly(
      row.actual_start_time,
    ),

  actualDurationMinutes:
    row.actual_duration_minutes,

  status:
    row.status as TrainingSessionStatus,

  plannedNotes:
    row.planned_notes,

  actualNotes:
    row.actual_notes,

  plannedRpe:
    mapNumeric(
      row.planned_rpe,
    ),

  actualRpe:
    mapNumeric(
      row.actual_rpe,
    ),

  source:
    row.source as TrainingSession['source'],

  externalId:
    row.external_id,

  createdByUserId:
    row.created_by_user_id as DkturboUserId,

  createdAt:
    row.created_at,

  updatedAt:
    row.updated_at,
});

export class PostgresSessionRepository
implements SessionRepository {

  public constructor(
    private readonly db:
      Kysely<TrainingDatabase>,
  ) {}

  public async createPlanned(
    data:
      CreatePlannedSessionData,
  ): Promise<TrainingSession> {

    const row =
      await this.db
        .insertInto(
          'training.sessions',
        )
        .values({
          day_id:
            data.dayId,

          athlete_id:
            data.athleteId,

          type:
            data.type,

          title:
            data.title,

          planned_start_time:
            data.plannedStartTime,

          planned_duration_minutes:
            data.plannedDurationMinutes,

          actual_start_time:
            null,

          actual_duration_minutes:
            null,

          planned_notes:
            data.plannedNotes,

          actual_notes:
            null,

          planned_rpe:
            data.plannedRpe === null
              ? null
              : String(
                  data.plannedRpe,
                ),

          actual_rpe:
            null,

          external_id:
            null,

          created_by_user_id:
            data.createdByUserId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

        return mapSession(
      row,
    );
  }

  public async updatePlanned(
    data:
      UpdatePlannedSessionData,
  ): Promise<TrainingSession | null> {

    const row =
      await this.db
        .updateTable(
          'training.sessions',
        )
        .set({
          day_id:
            data.dayId,

          type:
            data.type,

          title:
            data.title,

          planned_start_time:
            data.plannedStartTime,

          planned_duration_minutes:
            data.plannedDurationMinutes,

          planned_notes:
            data.plannedNotes,

          planned_rpe:
            data.plannedRpe ===
            null
              ? null
              : String(
                  data.plannedRpe,
                ),

          updated_at:
            new Date(),
        })
        .where(
          'id',
          '=',
          data.sessionId,
        )
        .where(
          'athlete_id',
          '=',
          data.athleteId,
        )
        .returningAll()
        .executeTakeFirst();

    return row
      ? mapSession(
          row,
        )
      : null;
  }

  public async delete(
    sessionId:
      TrainingSessionId,

    athleteId:
      AthleteId,
  ): Promise<boolean> {

    const result =
      await this.db
        .deleteFrom(
          'training.sessions',
        )
        .where(
          'id',
          '=',
          sessionId,
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

  public async findById(
    sessionId:
      TrainingSessionId,
  ): Promise<TrainingSession | null> {

    const row =
      await this.db
        .selectFrom(
          'training.sessions',
        )
        .selectAll()
        .where(
          'id',
          '=',
          sessionId,
        )
        .executeTakeFirst();

    return row
      ? mapSession(row)
      : null;
  }

  public async listForDay(
    dayId:
      TrainingDayId,
  ): Promise<TrainingSession[]> {

    const rows =
      await this.db
        .selectFrom(
          'training.sessions',
        )
        .selectAll()
        .where(
          'day_id',
          '=',
          dayId,
        )
        .orderBy(
          'planned_start_time',
          'asc',
        )
        .execute();

    return rows.map(
      mapSession,
    );
  }
}
