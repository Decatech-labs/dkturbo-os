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
  createWeek,
} from '../../application/index.js';

import type {
  AthleteId,
  DkturboUserId,
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

const testUserId =
  '10000000-0000-4000-8000-000000000091' as DkturboUserId;

const testAthleteId =
  '20000000-0000-4000-8000-000000000091' as AthleteId;

const conflictWeekId =
  '30000000-0000-4000-8000-000000000091';

const targetWeekStart =
  '2026-09-07';

const targetConflictDate =
  '2026-09-10';

describe(
  'createWeek PostgreSQL integration',
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

        /*
         * Clean any fixture left by a previously interrupted run.
         *
         * Athlete deletion cascades through Training.
         */
        await db
          .deleteFrom(
            'training.athletes',
          )
          .where(
            'id',
            '=',
            testAthleteId,
          )
          .execute();

        await sql`
          delete from identity.users
          where id = ${testUserId}
        `.execute(
          db,
        );

        /*
         * Create the DKTURBO identity required by
         * weeks.created_by_user_id.
         */
        await sql`
          insert into identity.users (
            id,
            name,
            role,
            created_at
          )
          values (
            ${testUserId},
            'Training Week Integration Test',
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
          .values({
            id:
              testAthleteId,

            display_name:
              'Week Atomicity Test Athlete',
          })
          .execute();

        await db
          .insertInto(
            'training.athlete_access',
          )
          .values({
            athlete_id:
              testAthleteId,

            user_id:
              testUserId,

            role:
              'COACH',
          })
          .execute();

        /*
         * Create a different valid week.
         *
         * We deliberately attach 2026-09-10 to it so the
         * unique (athlete_id, date) constraint will make
         * createWeek fail when it reaches its fourth day.
         *
         * This is only a controlled test fixture.
         */
        await db
          .insertInto(
            'training.weeks',
          )
          .values({
            id:
              conflictWeekId,

            athlete_id:
              testAthleteId,

            week_start:
              '2026-09-14',

            created_by_user_id:
              testUserId,

            title:
              'Conflict fixture',

            notes:
              null,
          })
          .execute();

        await db
          .insertInto(
            'training.days',
          )
          .values({
            week_id:
              conflictWeekId,

            athlete_id:
              testAthleteId,

            date:
              targetConflictDate,

            notes:
              null,
          })
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
            '=',
            testAthleteId,
          )
          .execute();

        await sql`
          delete from identity.users
          where id = ${testUserId}
        `.execute(
          db,
        );

        await db.destroy();
      },
    );

    it(
      'rolls back the week and previously created days when a later day fails',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        await expect(
          createWeek(
            unitOfWork,
            {
              athleteId:
                testAthleteId,

              weekStart:
                targetWeekStart,

              createdByUserId:
                testUserId,

              title:
                'Atomic week test',
            },
          ),
        ).rejects.toThrow();

        const persistedWeek =
          await db
            .selectFrom(
              'training.weeks',
            )
            .select([
              'id',
              'week_start',
            ])
            .where(
              'athlete_id',
              '=',
              testAthleteId,
            )
            .where(
              'week_start',
              '=',
              targetWeekStart,
            )
            .executeTakeFirst();

        expect(
          persistedWeek,
        ).toBeUndefined();

        const persistedTargetDays =
          await db
            .selectFrom(
              'training.days',
            )
            .select([
              'date',
            ])
            .where(
              'athlete_id',
              '=',
              testAthleteId,
            )
            .where(
              'date',
              'in',
              [
                '2026-09-07',
                '2026-09-08',
                '2026-09-09',
              ],
            )
            .orderBy(
              'date',
              'asc',
            )
            .execute();

        expect(
          persistedTargetDays,
        ).toEqual(
          [],
        );

        const conflictDay =
          await db
            .selectFrom(
              'training.days',
            )
            .select([
              'date',
              'week_id',
            ])
            .where(
              'athlete_id',
              '=',
              testAthleteId,
            )
            .where(
              'date',
              '=',
              targetConflictDate,
            )
            .executeTakeFirstOrThrow();

        expect(
          conflictDay.week_id,
        ).toBe(
          conflictWeekId,
        );
      },
    );
  },
);
