import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  Kysely,
  PostgresDialect,
  sql,
} from 'kysely';

import {
  Pool,
} from 'pg';

import {
  createPlannedSession,
} from '../../application/index.js';

import type {
  AthleteId,
  DkturboUserId,
  TrainingDayId,
} from '../../domain/index.js';

import type {
  TrainingDatabase,
} from './database.js';

import {
  PostgresTrainingUnitOfWork,
} from './postgres-training-unit-of-work.js';

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required for Training integration tests',
  );
}

const userId =
  '10000000-0000-4000-8000-000000000081' as DkturboUserId;

const athleteAId =
  '20000000-0000-4000-8000-000000000081' as AthleteId;

const athleteBId =
  '20000000-0000-4000-8000-000000000082' as AthleteId;

const weekAId =
  '30000000-0000-4000-8000-000000000081';

const weekBId =
  '30000000-0000-4000-8000-000000000082';

const dayAId =
  '40000000-0000-4000-8000-000000000081' as TrainingDayId;

const dayBId =
  '40000000-0000-4000-8000-000000000082' as TrainingDayId;

describe(
  'createPlannedSession PostgreSQL integration',
  () => {

    let db:
      Kysely<TrainingDatabase>;

    beforeAll(
      async () => {

        db =
          new Kysely<TrainingDatabase>({
            dialect:
              new PostgresDialect({
                pool:
                  new Pool({
                    connectionString:
                      databaseUrl,
                  }),
              }),
          });

        await db
          .deleteFrom(
            'training.athletes',
          )
          .where(
            'id',
            'in',
            [
              athleteAId,
              athleteBId,
            ],
          )
          .execute();

        await sql`
          delete from identity.users
          where id = ${userId}
        `.execute(
          db,
        );

        await sql`
          insert into identity.users (
            id,
            name,
            role,
            created_at
          )
          values (
            ${userId},
            'Training Session Integration Test',
            'member',
            current_timestamp
          )
        `.execute(
          db,
        );

        await db
          .insertInto(
            'training.athletes',
          )
          .values([
            {
              id:
                athleteAId,

              display_name:
                'Session Test Athlete A',
            },
            {
              id:
                athleteBId,

              display_name:
                'Session Test Athlete B',
            },
          ])
          .execute();

        await db
          .insertInto(
            'training.athlete_access',
          )
          .values([
            {
              athlete_id:
                athleteAId,

              user_id:
                userId,

              role:
                'COACH',
            },
            {
              athlete_id:
                athleteBId,

              user_id:
                userId,

              role:
                'COACH',
            },
          ])
          .execute();

        await db
          .insertInto(
            'training.weeks',
          )
          .values([
            {
              id:
                weekAId,

              athlete_id:
                athleteAId,

              week_start:
                '2026-09-07',

              created_by_user_id:
                userId,

              title:
                null,

              notes:
                null,
            },
            {
              id:
                weekBId,

              athlete_id:
                athleteBId,

              week_start:
                '2026-09-07',

              created_by_user_id:
                userId,

              title:
                null,

              notes:
                null,
            },
          ])
          .execute();

        await db
          .insertInto(
            'training.days',
          )
          .values([
            {
              id:
                dayAId,

              week_id:
                weekAId,

              athlete_id:
                athleteAId,

              date:
                '2026-09-08',

              notes:
                null,
            },
            {
              id:
                dayBId,

              week_id:
                weekBId,

              athlete_id:
                athleteBId,

              date:
                '2026-09-08',

              notes:
                null,
            },
          ])
          .execute();
      },
    );

    afterAll(
      async () => {

        await db
          .deleteFrom(
            'training.athletes',
          )
          .where(
            'id',
            'in',
            [
              athleteAId,
              athleteBId,
            ],
          )
          .execute();

        await sql`
          delete from identity.users
          where id = ${userId}
        `.execute(
          db,
        );

        await db.destroy();
      },
    );

    it(
      'persists a valid planned session with planned and actual data separated',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        const created =
          await createPlannedSession(
            unitOfWork,
            {
              athleteId:
                athleteAId,

              dayId:
                dayAId,

              type:
                'STRENGTH',

              title:
                'Sentadilla',

              plannedStartTime:
                '18:00',

              plannedDurationMinutes:
                75,

              plannedNotes:
                '4x6',

              plannedRpe:
                8,

              createdByUserId:
                userId,
            },
          );

        expect(
          created.status,
        ).toBe(
          'PLANNED',
        );

        expect(
          created.source,
        ).toBe(
          'MANUAL',
        );

        expect(
          created.actualStartTime,
        ).toBeNull();

        expect(
          created.actualDurationMinutes,
        ).toBeNull();

        expect(
          created.actualNotes,
        ).toBeNull();

        expect(
          created.actualRpe,
        ).toBeNull();

        const persisted =
          await db
            .selectFrom(
              'training.sessions',
            )
            .selectAll()
            .where(
              'id',
              '=',
              created.id,
            )
            .executeTakeFirstOrThrow();

        expect(
          persisted.status,
        ).toBe(
          'PLANNED',
        );

        expect(
          persisted.source,
        ).toBe(
          'MANUAL',
        );

        expect(
          persisted.actual_start_time,
        ).toBeNull();

        expect(
          persisted.actual_duration_minutes,
        ).toBeNull();

        expect(
          persisted.actual_notes,
        ).toBeNull();

        expect(
          persisted.actual_rpe,
        ).toBeNull();
      },
    );

    it(
      'rejects a session that crosses day and athlete boundaries',
      async () => {

        await expect(
          db
            .insertInto(
              'training.sessions',
            )
            .values({
              day_id:
                dayAId,

              athlete_id:
                athleteBId,

              type:
                'RUNNING',

              title:
                'Cross athlete session',

              planned_start_time:
                null,

              planned_duration_minutes:
                null,

              actual_start_time:
                null,

              actual_duration_minutes:
                null,

              planned_notes:
                null,

              actual_notes:
                null,

              planned_rpe:
                null,

              actual_rpe:
                null,

              external_id:
                null,

              created_by_user_id:
                userId,
            })
            .execute(),
        ).rejects.toMatchObject({
          code:
            '23503',
        });

        const crossSession =
          await db
            .selectFrom(
              'training.sessions',
            )
            .select([
              'id',
            ])
            .where(
              'title',
              '=',
              'Cross athlete session',
            )
            .executeTakeFirst();

        expect(
          crossSession,
        ).toBeUndefined();
      },
    );
  },
);
