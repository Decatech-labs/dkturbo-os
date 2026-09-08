import type {
  Kysely,
} from 'kysely';

import type {
  AthleteId,
  TrainingDay,
  TrainingDayId,
  TrainingWeek,
  TrainingWeekId,
  TrainingWeekStatus,
} from '../../domain/index.js';

import type {
  CreateDayData,
  CreateWeekData,
  WeekRepository,
} from '../../ports/index.js';

import type {
  TrainingDatabase,
} from './database.js';

const mapWeek = (
  row: {
    id: string;
    athlete_id: string;
    week_start: string;
    status: string;
    title: string | null;
    notes: string | null;
    created_by_user_id: string;
    created_at: Date;
    updated_at: Date;
  },
): TrainingWeek => ({
  id:
    row.id as TrainingWeekId,

  athleteId:
    row.athlete_id as AthleteId,

  weekStart:
    row.week_start,

  status:
    row.status as TrainingWeekStatus,

  title:
    row.title,

  notes:
    row.notes,

  createdByUserId:
    row.created_by_user_id as TrainingWeek['createdByUserId'],

  createdAt:
    row.created_at,

  updatedAt:
    row.updated_at,
});

const mapDay = (
  row: {
    id: string;
    week_id: string;
    athlete_id: string;
    date: string;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
  },
): TrainingDay => ({
  id:
    row.id as TrainingDayId,

  weekId:
    row.week_id as TrainingWeekId,

  athleteId:
    row.athlete_id as AthleteId,

  date:
    row.date,

  notes:
    row.notes,

  createdAt:
    row.created_at,

  updatedAt:
    row.updated_at,
});

export class PostgresWeekRepository
implements WeekRepository {

  public constructor(
    private readonly db:
      Kysely<TrainingDatabase>,
  ) {}

  public async createWeek(
    data: CreateWeekData,
  ): Promise<TrainingWeek> {

    const row =
      await this.db
        .insertInto(
          'training.weeks',
        )
        .values({
          athlete_id:
            data.athleteId,

          week_start:
            data.weekStart,

          title:
            data.title ?? null,

          notes:
            data.notes ?? null,

          created_by_user_id:
            data.createdByUserId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapWeek(row);
  }

  public async createDay(
    data: CreateDayData,
  ): Promise<TrainingDay> {

    const row =
      await this.db
        .insertInto(
          'training.days',
        )
        .values({
          week_id:
            data.weekId,

          athlete_id:
            data.athleteId,

          date:
            data.date,

          notes:
            data.notes ?? null,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapDay(row);
  }

  public async findWeekById(
    weekId: TrainingWeekId,
  ): Promise<TrainingWeek | null> {

    const row =
      await this.db
        .selectFrom(
          'training.weeks',
        )
        .selectAll()
        .where(
          'id',
          '=',
          weekId,
        )
        .executeTakeFirst();

    return row
      ? mapWeek(row)
      : null;
  }

  public async findWeekByAthleteAndStart(
    athleteId: AthleteId,
    weekStart: string,
  ): Promise<TrainingWeek | null> {

    const row =
      await this.db
        .selectFrom(
          'training.weeks',
        )
        .selectAll()
        .where(
          'athlete_id',
          '=',
          athleteId,
        )
        .where(
          'week_start',
          '=',
          weekStart,
        )
        .executeTakeFirst();

    return row
      ? mapWeek(row)
      : null;
  }

  public async listDaysForWeek(
    weekId: TrainingWeekId,
  ): Promise<TrainingDay[]> {

    const rows =
      await this.db
        .selectFrom(
          'training.days',
        )
        .selectAll()
        .where(
          'week_id',
          '=',
          weekId,
        )
        .orderBy(
          'date',
          'asc',
        )
        .execute();

    return rows.map(
      mapDay,
    );
  }
}
