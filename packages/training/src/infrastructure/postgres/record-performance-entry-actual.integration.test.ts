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
  recordPerformanceEntryActual,
} from '../../application/index.js';

import type {
  AthleteId,
  DkturboUserId,
  PerformanceEntryId,
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
  'b1000000-0000-4000-8000-000000000001' as DkturboUserId;

const athleteId =
  'b2000000-0000-4000-8000-000000000001' as AthleteId;

const weekId =
  'b3000000-0000-4000-8000-000000000001';

const dayId =
  'b4000000-0000-4000-8000-000000000001';

const sessionId =
  'b5000000-0000-4000-8000-000000000001';

const blockId =
  'b6000000-0000-4000-8000-000000000001';

const exerciseId =
  'b7000000-0000-4000-8000-000000000001';

const sessionExerciseId =
  'b8000000-0000-4000-8000-000000000001';

const performanceEntryId =
  'b9000000-0000-4000-8000-000000000001' as PerformanceEntryId;

describe(
  'recordPerformanceEntryActual PostgreSQL integration',
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
            '=',
            athleteId,
          )
          .execute();

        await db
          .deleteFrom(
            'training.exercise_catalog',
          )
          .where(
            'id',
            '=',
            exerciseId,
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
            'Record Actual Integration Test',
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
              athleteId,

            display_name:
              'Record Actual Athlete',
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
              'Actual recording session',

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
              'Fuerza principal',

            notes:
              null,
          })
          .execute();

        await db
          .insertInto(
            'training.exercise_catalog',
          )
          .values({
            id:
              exerciseId,

            name:
              'Sentadilla',

            category:
              'Fuerza',

            sport:
              null,

            metric_profile:
              'STRENGTH',

            origin:
              'SYSTEM',

            created_by_user_id:
              null,

            archived_at:
              null,
          })
          .execute();

        await db
          .insertInto(
            'training.session_exercises',
          )
          .values({
            id:
              sessionExerciseId,

            block_id:
              blockId,

            session_id:
              sessionId,

            athlete_id:
              athleteId,

            exercise_id:
              exerciseId,

            position:
              0,

            planned_notes:
              null,

            actual_notes:
              null,
          })
          .execute();

        await db
          .insertInto(
            'training.performance_entries',
          )
          .values({
            id:
              performanceEntryId,

            session_exercise_id:
              sessionExerciseId,

            athlete_id:
              athleteId,

            position:
              0,

            planned_reps:
              6,

            actual_reps:
              null,

            planned_load_kg:
              '80',

            actual_load_kg:
              null,

            planned_distance_m:
              null,

            actual_distance_m:
              null,

            planned_duration_ms:
              null,

            actual_duration_ms:
              null,

            planned_result_m:
              null,

            actual_result_m:
              null,

            planned_height_m:
              null,

            actual_height_m:
              null,

            planned_rpe:
              '8',

            actual_rpe:
              null,

            planned_rir:
              '2',

            actual_rir:
              null,

            planned_rest_seconds:
              180,

            actual_rest_seconds:
              null,

            actual_success:
              null,

            actual_is_foul:
              null,

            planned_metrics: {
              tempo:
                '3-1-1',
            },

            actual_metrics:
              {},

            planned_notes:
              'Plan original',

            actual_notes:
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
            'id',
            '=',
            exerciseId,
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
      'updates only actual values while preserving planned values',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        const result =
          await recordPerformanceEntryActual(
            unitOfWork,
            {
              athleteId,

              performanceEntryId,

              reps:
                6,

              loadKg:
                82.5,

              rpe:
                8.5,

              rir:
                1,

              restSeconds:
                200,

              metrics: {
                pain:
                  1,
              },

              notes:
                'Ejecución real',

              updatedByUserId:
                userId,
            },
          );

        expect(
          result.plannedReps,
        ).toBe(
          6,
        );

        expect(
          result.plannedLoadKg,
        ).toBe(
          80,
        );

        expect(
          result.plannedRpe,
        ).toBe(
          8,
        );

        expect(
          result.plannedRir,
        ).toBe(
          2,
        );

        expect(
          result.plannedRestSeconds,
        ).toBe(
          180,
        );

        expect(
          result.plannedMetrics,
        ).toEqual({
          tempo:
            '3-1-1',
        });

        expect(
          result.plannedNotes,
        ).toBe(
          'Plan original',
        );

        expect(
          result.actualReps,
        ).toBe(
          6,
        );

        expect(
          result.actualLoadKg,
        ).toBe(
          82.5,
        );

        expect(
          result.actualRpe,
        ).toBe(
          8.5,
        );

        expect(
          result.actualRir,
        ).toBe(
          1,
        );

        expect(
          result.actualRestSeconds,
        ).toBe(
          200,
        );

        expect(
          result.actualMetrics,
        ).toEqual({
          pain:
            1,
        });

        expect(
          result.actualNotes,
        ).toBe(
          'Ejecución real',
        );

        const persisted =
          await db
            .selectFrom(
              'training.performance_entries',
            )
            .selectAll()
            .where(
              'id',
              '=',
              performanceEntryId,
            )
            .executeTakeFirstOrThrow();

        expect(
          persisted.planned_reps,
        ).toBe(
          6,
        );

        expect(
          persisted.planned_load_kg,
        ).toBe(
          '80',
        );

        expect(
          persisted.planned_rpe,
        ).toBe(
          '8',
        );

        expect(
          persisted.planned_rir,
        ).toBe(
          '2',
        );

        expect(
          persisted.planned_rest_seconds,
        ).toBe(
          180,
        );

        expect(
          persisted.planned_metrics,
        ).toEqual({
          tempo:
            '3-1-1',
        });

        expect(
          persisted.planned_notes,
        ).toBe(
          'Plan original',
        );

        expect(
          persisted.actual_reps,
        ).toBe(
          6,
        );

        expect(
          persisted.actual_load_kg,
        ).toBe(
          '82.5',
        );

        expect(
          persisted.actual_rpe,
        ).toBe(
          '8.5',
        );

        expect(
          persisted.actual_rir,
        ).toBe(
          '1',
        );

        expect(
          persisted.actual_rest_seconds,
        ).toBe(
          200,
        );

        expect(
          persisted.actual_metrics,
        ).toEqual({
          pain:
            1,
        });

        expect(
          persisted.actual_notes,
        ).toBe(
          'Ejecución real',
        );
      },
    );

    it(
      'does not update an entry when athlete scope does not match',
      async () => {

        const otherAthleteId =
          'b2000000-0000-4000-8000-000000000099' as AthleteId;

        /*
         * We test repository-level SQL scoping directly.
         * No row should match:
         *
         * WHERE id = performanceEntryId
         * AND athlete_id = otherAthleteId
         */
        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        await expect(
          unitOfWork.execute(
            async ({
              sessionStructure,
            }) =>
              sessionStructure
                .updatePerformanceEntryActual({
                  performanceEntryId,

                  athleteId:
                    otherAthleteId,

                  actualReps:
                    99,

                  actualLoadKg:
                    null,

                  actualDistanceM:
                    null,

                  actualDurationMs:
                    null,

                  actualResultM:
                    null,

                  actualHeightM:
                    null,

                  actualRpe:
                    null,

                  actualRir:
                    null,

                  actualRestSeconds:
                    null,

                  actualSuccess:
                    null,

                  actualIsFoul:
                    null,

                  actualMetrics:
                    {},

                  actualNotes:
                    'Should never persist',
                }),
          ),
        ).rejects.toThrow();

        const persisted =
          await db
            .selectFrom(
              'training.performance_entries',
            )
            .select([
              'actual_reps',
              'actual_notes',
            ])
            .where(
              'id',
              '=',
              performanceEntryId,
            )
            .executeTakeFirstOrThrow();

        expect(
          persisted.actual_reps,
        ).toBe(
          6,
        );

        expect(
          persisted.actual_notes,
        ).toBe(
          'Ejecución real',
        );
      },
    );
  },
);
