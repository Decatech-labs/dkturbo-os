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
  getSessionDetail,
} from '../../application/index.js';

import type {
  AthleteId,
  DkturboUserId,
  TrainingSessionId,
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

/*
 * Dedicated fixture namespace for this suite.
 *
 * c* UUIDs deliberately avoid every other current
 * integration-test namespace so Vitest can execute
 * the files concurrently.
 */
const coachUserId =
  'c1000000-0000-4000-8000-000000000001' as DkturboUserId;

const viewerUserId =
  'c1000000-0000-4000-8000-000000000002' as DkturboUserId;

const athleteId =
  'c2000000-0000-4000-8000-000000000001' as AthleteId;

const weekId =
  'c3000000-0000-4000-8000-000000000001';

const dayId =
  'c4000000-0000-4000-8000-000000000001';

const sessionId =
  'c5000000-0000-4000-8000-000000000001' as TrainingSessionId;

const blockStrengthId =
  'c6000000-0000-4000-8000-000000000001';

const blockTechniqueId =
  'c6000000-0000-4000-8000-000000000002';

const squatExerciseId =
  'c7000000-0000-4000-8000-000000000001';

const customExerciseId =
  'c7000000-0000-4000-8000-000000000002';

const poleVaultExerciseId =
  'c7000000-0000-4000-8000-000000000003';

const squatSessionExerciseId =
  'c8000000-0000-4000-8000-000000000001';

const customSessionExerciseId =
  'c8000000-0000-4000-8000-000000000002';

const poleVaultSessionExerciseId =
  'c8000000-0000-4000-8000-000000000003';

const squatEntry0Id =
  'c9000000-0000-4000-8000-000000000001';

const squatEntry1Id =
  'c9000000-0000-4000-8000-000000000002';

const customEntryId =
  'c9000000-0000-4000-8000-000000000003';

const poleVaultEntryId =
  'c9000000-0000-4000-8000-000000000004';

describe(
  'getSessionDetail PostgreSQL integration',
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
         * Defensive cleanup from an interrupted run.
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
            'id',
            'in',
            [
              squatExerciseId,
              customExerciseId,
              poleVaultExerciseId,
            ],
          )
          .execute();

        await sql`
          delete from identity.users
          where id in (
            ${coachUserId},
            ${viewerUserId}
          )
        `.execute(
          db,
        );

        /*
         * Platform identities.
         */
        await sql`
          insert into identity.users (
            id,
            name,
            role,
            created_at
          )
          values
          (
            ${coachUserId},
            'Session Detail Coach',
            'member',
            current_timestamp
          ),
          (
            ${viewerUserId},
            'Session Detail Viewer',
            'member',
            current_timestamp
          )
        `.execute(
          db,
        );

        /*
         * Athlete + explicit Training permissions.
         */
        await db
          .insertInto(
            'training.athletes',
          )
          .values({
            id:
              athleteId,

            display_name:
              'Session Detail Athlete',
          })
          .execute();

        await db
          .insertInto(
            'training.athlete_access',
          )
          .values([
            {
              athlete_id:
                athleteId,

              user_id:
                coachUserId,

              role:
                'COACH',
            },
            {
              athlete_id:
                athleteId,

              user_id:
                viewerUserId,

              role:
                'VIEWER',
            },
          ])
          .execute();

        /*
         * Week -> day -> session.
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
              'Semana de integración',

            notes:
              null,

            created_by_user_id:
              coachUserId,
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
              '2026-09-09',

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
              'Fuerza + técnica',

            planned_start_time:
              '10:00',

            planned_duration_minutes:
              90,

            actual_start_time:
              null,

            actual_duration_minutes:
              null,

            planned_notes:
              'Sesión completa',

            actual_notes:
              null,

            planned_rpe:
              '8',

            actual_rpe:
              null,

            external_id:
              null,

            created_by_user_id:
              coachUserId,
          })
          .execute();

        /*
         * Insert deliberately OUT OF ORDER.
         *
         * Query result must still be:
         *
         * 0 Fuerza
         * 1 Técnica
         */
        await db
          .insertInto(
            'training.session_blocks',
          )
          .values([
            {
              id:
                blockTechniqueId,

              session_id:
                sessionId,

              athlete_id:
                athleteId,

              position:
                1,

              title:
                'Técnica',

              notes:
                null,
            },
            {
              id:
                blockStrengthId,

              session_id:
                sessionId,

              athlete_id:
                athleteId,

              position:
                0,

              title:
                'Fuerza',

              notes:
                null,
            },
          ])
          .execute();

        /*
         * Shared exercise catalog.
         *
         * One CUSTOM exercise keeps its creator so the UI
         * can later resolve and display its author.
         */
        await db
          .insertInto(
            'training.exercise_catalog',
          )
          .values([
            {
              id:
                squatExerciseId,

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
            },
            {
              id:
                customExerciseId,

              name:
                'Saltos desde banco',

              category:
                'Pliometría',

              sport:
                'Atletismo',

              metric_profile:
                'GENERIC',

              origin:
                'CUSTOM',

              created_by_user_id:
                coachUserId,

              archived_at:
                null,
            },
            {
              id:
                poleVaultExerciseId,

              name:
                'Pértiga - intentos',

              category:
                'Técnica',

              sport:
                'Atletismo',

              metric_profile:
                'ATTEMPT_HEIGHT',

              origin:
                'SYSTEM',

              created_by_user_id:
                null,

              archived_at:
                null,
            },
          ])
          .execute();

        /*
         * Strength block:
         *
         * position 0 = Sentadilla
         * position 1 = Saltos desde banco
         *
         * Again inserted in reverse order.
         */
        await db
          .insertInto(
            'training.session_exercises',
          )
          .values([
            {
              id:
                customSessionExerciseId,

              block_id:
                blockStrengthId,

              session_id:
                sessionId,

              athlete_id:
                athleteId,

              exercise_id:
                customExerciseId,

              position:
                1,

              planned_notes:
                '3 bloques',

              actual_notes:
                null,
            },
            {
              id:
                squatSessionExerciseId,

              block_id:
                blockStrengthId,

              session_id:
                sessionId,

              athlete_id:
                athleteId,

              exercise_id:
                squatExerciseId,

              position:
                0,

              planned_notes:
                'Trabajo principal',

              actual_notes:
                null,
            },
            {
              id:
                poleVaultSessionExerciseId,

              block_id:
                blockTechniqueId,

              session_id:
                sessionId,

              athlete_id:
                athleteId,

              exercise_id:
                poleVaultExerciseId,

              position:
                0,

              planned_notes:
                null,

              actual_notes:
                null,
            },
          ])
          .execute();

        /*
         * Squat entries deliberately inserted:
         *
         * position 1 first
         * position 0 second
         */
        await db
          .insertInto(
            'training.performance_entries',
          )
          .values([
            {
              id:
                squatEntry1Id,

              session_exercise_id:
                squatSessionExerciseId,

              athlete_id:
                athleteId,

              position:
                1,

              planned_reps:
                6,

              actual_reps:
                5,

              planned_load_kg:
                '80',

              actual_load_kg:
                '82.5',

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
                '9',

              planned_rir:
                null,

              actual_rir:
                null,

              planned_rest_seconds:
                180,

              actual_rest_seconds:
                200,

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
            },
            {
              id:
                squatEntry0Id,

              session_exercise_id:
                squatSessionExerciseId,

              athlete_id:
                athleteId,

              position:
                0,

              planned_reps:
                6,

              actual_reps:
                6,

              planned_load_kg:
                '80',

              actual_load_kg:
                '82.5',

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
                '8.5',

              planned_rir:
                null,

              actual_rir:
                null,

              planned_rest_seconds:
                180,

              actual_rest_seconds:
                180,

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
            },
            {
              id:
                customEntryId,

              session_exercise_id:
                customSessionExerciseId,

              athlete_id:
                athleteId,

              position:
                0,

              planned_reps:
                null,

              actual_reps:
                8,

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

              actual_metrics: {
                boxHeightCm:
                  60,
              },

              planned_notes:
                null,

              actual_notes:
                'Añadido durante la sesión',
            },
            {
              id:
                poleVaultEntryId,

              session_exercise_id:
                poleVaultSessionExerciseId,

              athlete_id:
                athleteId,

              position:
                0,

              planned_reps:
                null,

              actual_reps:
                null,

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
                '5',

              actual_height_m:
                '5',

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
                true,

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
            },
          ])
          .execute();
      },
    );

    afterAll(
      async () => {

        /*
         * Athlete deletion cascades through the private
         * Training hierarchy and athlete_access.
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

        /*
         * Catalog items are intentionally independent from
         * athlete lifetime, so clean them explicitly.
         */
        await db
          .deleteFrom(
            'training.exercise_catalog',
          )
          .where(
            'id',
            'in',
            [
              squatExerciseId,
              customExerciseId,
              poleVaultExerciseId,
            ],
          )
          .execute();

        await sql`
          delete from identity.users
          where id in (
            ${coachUserId},
            ${viewerUserId}
          )
        `.execute(
          db,
        );

        await db.destroy();
      },
    );

    it(
      'returns the complete ordered session aggregate for a coach',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        const result =
          await getSessionDetail(
            unitOfWork,
            {
              athleteId,

              sessionId,

              userId:
                coachUserId,
            },
          );

        expect(
          result.accessRole,
        ).toBe(
          'COACH',
        );

        expect(
          result.canWrite,
        ).toBe(
          true,
        );

        expect(
          result.session.title,
        ).toBe(
          'Fuerza + técnica',
        );

        /*
         * Blocks ordered by position.
         */
        expect(
          result.blocks.map(
            ({
              block,
            }) =>
              block.title,
          ),
        ).toEqual([
          'Fuerza',
          'Técnica',
        ]);

        expect(
          result.blocks.map(
            ({
              block,
            }) =>
              block.position,
          ),
        ).toEqual([
          0,
          1,
        ]);

        const strengthBlock =
          result.blocks[0];

        expect(
          strengthBlock,
        ).toBeDefined();

        if (!strengthBlock) {
          throw new Error(
            'Strength block was not returned',
          );
        }

        /*
         * Exercises ordered by position.
         */
        expect(
          strengthBlock.exercises.map(
            ({
              catalogItem,
            }) =>
              catalogItem.name,
          ),
        ).toEqual([
          'Sentadilla',
          'Saltos desde banco',
        ]);

        expect(
          strengthBlock.exercises.map(
            ({
              sessionExercise:
                exercise,
            }) =>
              exercise.position,
          ),
        ).toEqual([
          0,
          1,
        ]);

        const squat =
          strengthBlock.exercises[0];

        const custom =
          strengthBlock.exercises[1];

        expect(
          squat,
        ).toBeDefined();

        expect(
          custom,
        ).toBeDefined();

        if (
          !squat ||
          !custom
        ) {
          throw new Error(
            'Expected exercises were not returned',
          );
        }

        /*
         * Performance entries ordered by position.
         */
        expect(
          squat.performanceEntries.map(
            ({
              position,
            }) =>
              position,
          ),
        ).toEqual([
          0,
          1,
        ]);

        expect(
          squat.performanceEntries[0]
            ?.plannedLoadKg,
        ).toBe(
          80,
        );

        expect(
          squat.performanceEntries[0]
            ?.actualLoadKg,
        ).toBe(
          82.5,
        );

        expect(
          squat.performanceEntries[1]
            ?.actualReps,
        ).toBe(
          5,
        );

        /*
         * CUSTOM exercise keeps authorship.
         */
        expect(
          custom.catalogItem.origin,
        ).toBe(
          'CUSTOM',
        );

        expect(
          custom.catalogItem.createdByUserId,
        ).toBe(
          coachUserId,
        );

        expect(
          custom.performanceEntries[0]
            ?.actualMetrics,
        ).toEqual({
          boxHeightCm:
            60,
        });

        /*
         * Second block.
         */
        const techniqueBlock =
          result.blocks[1];

        expect(
          techniqueBlock,
        ).toBeDefined();

        if (!techniqueBlock) {
          throw new Error(
            'Technique block was not returned',
          );
        }

        expect(
          techniqueBlock.exercises[0]
            ?.catalogItem.name,
        ).toBe(
          'Pértiga - intentos',
        );

        expect(
          techniqueBlock.exercises[0]
            ?.performanceEntries[0]
            ?.actualHeightM,
        ).toBe(
          5,
        );

        expect(
          techniqueBlock.exercises[0]
            ?.performanceEntries[0]
            ?.actualSuccess,
        ).toBe(
          true,
        );
      },
    );

    it(
      'returns the same aggregate to a viewer but marks it read-only',
      async () => {

        const unitOfWork =
          new PostgresTrainingUnitOfWork(
            db,
          );

        const coachResult =
          await getSessionDetail(
            unitOfWork,
            {
              athleteId,

              sessionId,

              userId:
                coachUserId,
            },
          );

        const viewerResult =
          await getSessionDetail(
            unitOfWork,
            {
              athleteId,

              sessionId,

              userId:
                viewerUserId,
            },
          );

        expect(
          viewerResult.accessRole,
        ).toBe(
          'VIEWER',
        );

        expect(
          viewerResult.canWrite,
        ).toBe(
          false,
        );

        /*
         * Access metadata differs.
         * Domain content does not.
         */
        expect(
          viewerResult.session,
        ).toEqual(
          coachResult.session,
        );

        expect(
          viewerResult.blocks,
        ).toEqual(
          coachResult.blocks,
        );

        expect(
          viewerResult.blocks,
        ).toHaveLength(
          2,
        );
      },
    );
  },
);
