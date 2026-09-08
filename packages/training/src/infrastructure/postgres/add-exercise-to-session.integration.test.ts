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
  addExerciseToSession,
} from '../../application/index.js';

import type {
  AthleteId,
  DkturboUserId,
  SessionBlockId,
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
  '10000000-0000-4000-8000-000000000071' as DkturboUserId;

const athleteId =
  '20000000-0000-4000-8000-000000000071' as AthleteId;

const weekId =
  '30000000-0000-4000-8000-000000000071';

const dayId =
  '40000000-0000-4000-8000-000000000071';

const sessionId =
  '50000000-0000-4000-8000-000000000071';

const blockId =
  '60000000-0000-4000-8000-000000000071' as SessionBlockId;

describe(
  'addExerciseToSession PostgreSQL integration',
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
         * Clean fixture from a previously interrupted run.
         */
        await db
          .deleteFrom(
            'training.athletes',
          )
          .where(
            'id',
            '=',
            athleteId,
          )
          .execute();

        await db
          .deleteFrom(
            'training.exercise_catalog',
          )
          .where(
            'created_by_user_id',
            '=',
            userId,
          )
          .execute();

        await sql`
          delete from identity.users
          where id = ${userId}
        `.execute(
          db,
        );

        /*
         * Identity.
         */
        await sql`
          insert into identity.users (
            id,
            name,
            role,
            created_at
          )
          values (
            ${userId},
            'Exercise Integration Test User',
            'member',
            current_timestamp
          )
        `.execute(
          db,
        );

        /*
         * Athlete + write access.
         */
        await db
          .insertInto(
            'training.athletes',
          )
          .values({
            id:
              athleteId,

            display_name:
              'Exercise Integration Test Athlete',
          })
          .execute();

        await db
          .insertInto(
            'training.athlete_access',
          )
          .values({
            athlete_id:
              athleteId,

            user_id:
              userId,

            role:
              'COACH',
          })
          .execute();

        /*
         * Week -> day -> session -> block.
         */
        await db
          .insertInto(
            'training.weeks',
          )
          .values({
            id:
              weekId,

            athlete_id:
              athleteId,

            week_start:
              '2026-09-07',

            title:
              null,

            notes:
              null,

            created_by_user_id:
              userId,
          })
          .execute();

        await db
          .insertInto(
            'training.days',
          )
          .values({
            id:
              dayId,

            week_id:
              weekId,

            athlete_id:
              athleteId,

            date:
              '2026-09-08',

            notes:
              null,
          })
          .execute();

        await db
          .insertInto(
            'training.sessions',
          )
          .values({
            id:
              sessionId,

            day_id:
              dayId,

            athlete_id:
              athleteId,

            type:
              'STRENGTH',

            title:
              'Exercise integration session',

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
          .execute();

        await db
          .insertInto(
            'training.session_blocks',
          )
          .values({
            id:
              blockId,

            session_id:
              sessionId,

            athlete_id:
              athleteId,

            position:
              0,

            title:
              'Main block',

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
            athleteId,
          )
          .execute();

        await db
          .deleteFrom(
            'training.exercise_catalog',
          )
          .where(
            'created_by_user_id',
            '=',
            userId,
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
      'creates a reusable CUSTOM exercise with its author and adds it to the block',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        const result =
          await addExerciseToSession(
            unitOfWork,
            {
              athleteId,

              blockId,

              position:
                0,

              manualExercise: {
                name:
                  'Saltos desde banco',

                category:
                  'Pliometría',

                sport:
                  'Atletismo',

                metricProfile:
                  'GENERIC',
              },

              plannedNotes:
                '3 bloques',

              createdByUserId:
                userId,
            },
          );

        expect(
          result.createdExercise,
        ).toBe(
          true,
        );

        expect(
          result.exercise.origin,
        ).toBe(
          'CUSTOM',
        );

        expect(
          result.exercise.createdByUserId,
        ).toBe(
          userId,
        );

        const persistedExercise =
          await db
            .selectFrom(
              'training.exercise_catalog',
            )
            .select([
              'id',
              'name',
              'origin',
              'created_by_user_id',
            ])
            .where(
              'id',
              '=',
              result.exercise.id,
            )
            .executeTakeFirstOrThrow();

        expect(
          persistedExercise,
        ).toMatchObject({
          name:
            'Saltos desde banco',

          origin:
            'CUSTOM',

          created_by_user_id:
            userId,
        });

        const persistedSessionExercise =
          await db
            .selectFrom(
              'training.session_exercises',
            )
            .select([
              'block_id',
              'session_id',
              'athlete_id',
              'exercise_id',
              'position',
              'planned_notes',
            ])
            .where(
              'id',
              '=',
              result.sessionExercise.id,
            )
            .executeTakeFirstOrThrow();

        expect(
          persistedSessionExercise,
        ).toMatchObject({
          block_id:
            blockId,

          session_id:
            sessionId,

          athlete_id:
            athleteId,

          exercise_id:
            result.exercise.id,

          position:
            0,

          planned_notes:
            '3 bloques',
        });
      },
    );

    it(
      'rolls back a newly created CUSTOM exercise when adding it to the block fails',
      async () => {

        /*
         * Position 0 is already occupied by the previous test.
         *
         * session_exercises has UNIQUE(block_id, position),
         * so this will fail only after the custom catalog
         * exercise has already been created inside the same
         * transaction.
         */
        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        const exerciseName =
          'Rollback orphan test';

        await expect(
          addExerciseToSession(
            unitOfWork,
            {
              athleteId,

              blockId,

              position:
                0,

              manualExercise: {
                name:
                  exerciseName,

                metricProfile:
                  'GENERIC',
              },

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toMatchObject({
          code:
            '23505',
        });

        const orphanExercise =
          await db
            .selectFrom(
              'training.exercise_catalog',
            )
            .select([
              'id',
            ])
            .where(
              'name',
              '=',
              exerciseName,
            )
            .where(
              'created_by_user_id',
              '=',
              userId,
            )
            .executeTakeFirst();

        expect(
          orphanExercise,
        ).toBeUndefined();
      },
    );
  },
);
