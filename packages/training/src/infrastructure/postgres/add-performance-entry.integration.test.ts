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
  addPerformanceEntry,
} from '../../application/index.js';

import type {
  AthleteId,
  DkturboUserId,
  SessionExerciseId,
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
  '10000000-0000-4000-8000-000000000061' as DkturboUserId;

const athleteAId =
  '20000000-0000-4000-8000-000000000061' as AthleteId;

const athleteBId =
  '20000000-0000-4000-8000-000000000062' as AthleteId;

const weekAId =
  '30000000-0000-4000-8000-000000000061';

const weekBId =
  '30000000-0000-4000-8000-000000000062';

const dayAId =
  '40000000-0000-4000-8000-000000000061';

const dayBId =
  '40000000-0000-4000-8000-000000000062';

const sessionAId =
  '50000000-0000-4000-8000-000000000061';

const sessionBId =
  '50000000-0000-4000-8000-000000000062';

const blockAId =
  '60000000-0000-4000-8000-000000000061';

const blockBId =
  '60000000-0000-4000-8000-000000000062';

const exerciseId =
  '70000000-0000-4000-8000-000000000061';

const sessionExerciseAId =
  '80000000-0000-4000-8000-000000000061' as SessionExerciseId;

const sessionExerciseBId =
  '80000000-0000-4000-8000-000000000062' as SessionExerciseId;

describe(
  'addPerformanceEntry PostgreSQL integration',
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
            'Performance Entry Integration Test',
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
                'Performance Athlete A',
            },
            {
              id:
                athleteBId,

              display_name:
                'Performance Athlete B',
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

              title:
                null,

              notes:
                null,

              created_by_user_id:
                userId,
            },
            {
              id:
                weekBId,

              athlete_id:
                athleteBId,

              week_start:
                '2026-09-07',

              title:
                null,

              notes:
                null,

              created_by_user_id:
                userId,
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

        await db
          .insertInto(
            'training.sessions',
          )
          .values([
            {
              id:
                sessionAId,

              day_id:
                dayAId,

              athlete_id:
                athleteAId,

              type:
                'STRENGTH',

              title:
                'Performance session A',

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
            },
            {
              id:
                sessionBId,

              day_id:
                dayBId,

              athlete_id:
                athleteBId,

              type:
                'THROWS',

              title:
                'Performance session B',

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
            },
          ])
          .execute();

        await db
          .insertInto(
            'training.session_blocks',
          )
          .values([
            {
              id:
                blockAId,

              session_id:
                sessionAId,

              athlete_id:
                athleteAId,

              position:
                0,

              title:
                'Main A',

              notes:
                null,
            },
            {
              id:
                blockBId,

              session_id:
                sessionBId,

              athlete_id:
                athleteBId,

              position:
                0,

              title:
                'Main B',

              notes:
                null,
            },
          ])
          .execute();

        await db
          .insertInto(
            'training.exercise_catalog',
          )
          .values({
            id:
              exerciseId,

            name:
              'Integration exercise',

            category:
              null,

            sport:
              null,

            metric_profile:
              'GENERIC',

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
          .values([
            {
              id:
                sessionExerciseAId,

              block_id:
                blockAId,

              session_id:
                sessionAId,

              athlete_id:
                athleteAId,

              exercise_id:
                exerciseId,

              position:
                0,

              planned_notes:
                null,

              actual_notes:
                null,
            },
            {
              id:
                sessionExerciseBId,

              block_id:
                blockBId,

              session_id:
                sessionBId,

              athlete_id:
                athleteBId,

              exercise_id:
                exerciseId,

              position:
                0,

              planned_notes:
                null,

              actual_notes:
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
      'persists planned and actual values separately including numeric and jsonb metrics',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        const result =
          await addPerformanceEntry(
            unitOfWork,
            {
              athleteId:
                athleteAId,

              sessionExerciseId:
                sessionExerciseAId,

              position:
                0,

              planned: {
                reps:
                  6,

                loadKg:
                  80,

                rpe:
                  8,

                metrics: {
                  tempo:
                    '3-1-1',
                },

                notes:
                  'Plan original',
              },

              actual: {
                reps:
                  5,

                loadKg:
                  82.5,

                rpe:
                  8.5,

                metrics: {
                  pain:
                    2,
                },

                notes:
                  'Ejecución real',
              },

              createdByUserId:
                userId,
            },
          );

        expect(
          result.plannedReps,
        ).toBe(
          6,
        );

        expect(
          result.actualReps,
        ).toBe(
          5,
        );

        expect(
          result.plannedLoadKg,
        ).toBe(
          80,
        );

        expect(
          result.actualLoadKg,
        ).toBe(
          82.5,
        );

        expect(
          result.plannedRpe,
        ).toBe(
          8,
        );

        expect(
          result.actualRpe,
        ).toBe(
          8.5,
        );

        expect(
          result.plannedMetrics,
        ).toEqual({
          tempo:
            '3-1-1',
        });

        expect(
          result.actualMetrics,
        ).toEqual({
          pain:
            2,
        });

        const persisted =
          await db
            .selectFrom(
              'training.performance_entries',
            )
            .selectAll()
            .where(
              'id',
              '=',
              result.id,
            )
            .executeTakeFirstOrThrow();

        expect(
          persisted.planned_reps,
        ).toBe(
          6,
        );

        expect(
          persisted.actual_reps,
        ).toBe(
          5,
        );

        expect(
          persisted.planned_load_kg,
        ).toBe(
          '80',
        );

        expect(
          persisted.actual_load_kg,
        ).toBe(
          '82.5',
        );

        expect(
          persisted.planned_metrics,
        ).toEqual({
          tempo:
            '3-1-1',
        });

        expect(
          persisted.actual_metrics,
        ).toEqual({
          pain:
            2,
        });
      },
    );

    it(
      'persists an actual-only improvised entry without inventing planned data',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        const result =
          await addPerformanceEntry(
            unitOfWork,
            {
              athleteId:
                athleteAId,

              sessionExerciseId:
                sessionExerciseAId,

              position:
                1,

              actual: {
                resultM:
                  63.1,

                isFoul:
                  false,

                notes:
                  'Intento añadido durante la sesión',
              },

              createdByUserId:
                userId,
            },
          );

        expect(
          result.plannedResultM,
        ).toBeNull();

        expect(
          result.actualResultM,
        ).toBe(
          63.1,
        );

        expect(
          result.actualIsFoul,
        ).toBe(
          false,
        );

        expect(
          result.plannedNotes,
        ).toBeNull();

        expect(
          result.actualNotes,
        ).toBe(
          'Intento añadido durante la sesión',
        );
      },
    );

    it(
      'rejects a performance entry that crosses session exercise and athlete boundaries',
      async () => {

        await expect(
          db
            .insertInto(
              'training.performance_entries',
            )
            .values({
              session_exercise_id:
                sessionExerciseAId,

              athlete_id:
                athleteBId,

              position:
                99,

              planned_reps:
                null,

              actual_reps:
                1,

              planned_load_kg:
                null,

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
                null,

              actual_rpe:
                null,

              planned_rir:
                null,

              actual_rir:
                null,

              planned_rest_seconds:
                null,

              actual_rest_seconds:
                null,

              actual_success:
                null,

              actual_is_foul:
                null,

              planned_metrics:
                {},

              actual_metrics:
                {},

              planned_notes:
                null,

              actual_notes:
                null,
            })
            .execute(),
        ).rejects.toMatchObject({
          code:
            '23503',
        });
      },
    );
  },
);
