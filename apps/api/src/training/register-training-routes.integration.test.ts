import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  createControlPlane,
  createDatabase,
  createHttpServer,
} from '@dkturbo/control-plane';

import {
  createTraining,
  createTrainingDatabase,
} from '@dkturbo/training';

import {
  registerTrainingRoutes,
} from './register-training-routes.js';

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required for API integration tests',
  );
}

/*
 * Dedicated d* UUID namespace for this suite.
 * Other Training integration suites currently use
 * different prefixes, so Vitest can run concurrently.
 */
const ownerUserId =
  'd1000000-0000-4000-8000-000000000001';

const athleteId =
  'd2000000-0000-4000-8000-000000000001';

const athleteAccessId =
  'd2100000-0000-4000-8000-000000000001';

const weekId =
  'd3000000-0000-4000-8000-000000000001';

const dayId =
  'd4000000-0000-4000-8000-000000000001';

const sessionId =
  'd5000000-0000-4000-8000-000000000001';

const blockId =
  'd6000000-0000-4000-8000-000000000001';

const exerciseId =
  'd7000000-0000-4000-8000-000000000001';

const sessionExerciseId =
  'd8000000-0000-4000-8000-000000000001';

const performanceEntryId =
  'd9000000-0000-4000-8000-000000000001';

describe(
  'Training HTTP routes PostgreSQL integration',
  () => {

    const controlDatabase =
      createDatabase({
        connectionString:
          databaseUrl,
      });

    const trainingDatabase =
      createTrainingDatabase({
        connectionString:
          databaseUrl,
      });

    const controlPlane =
      createControlPlane({
        database:
          controlDatabase,
      });

    const training =
      createTraining({
        database:
          trainingDatabase,
      });

    let authenticatedUserId:
      string | null =
        ownerUserId;

    const app =
      createHttpServer({
        database:
          controlDatabase,

        controlPlane,

        auth: {
          api: {
            getSession:
              async () =>
                authenticatedUserId
                  ? {
                      user: {
                        id:
                          authenticatedUserId,
                      },
                    }
                  : null,
          },

          handler:
            async () =>
              new Response(
                null,
                {
                  status:
                    404,
                },
              ),
        },

        registerRoutes:
          (http) => {
            registerTrainingRoutes({
              http,
              training,
            });
          },
      });

    beforeAll(
      async () => {

        /*
         * Defensive cleanup from interrupted runs.
         */
        await trainingDatabase
          .deleteFrom(
            'training.athletes',
          )
          .where(
            'id',
            '=',
            athleteId,
          )
          .execute();

        await trainingDatabase
          .deleteFrom(
            'training.exercise_catalog',
          )
          .where(
            'id',
            '=',
            exerciseId,
          )
          .execute();

        await controlDatabase
          .deleteFrom(
            'identity.users',
          )
          .where(
            'id',
            '=',
            ownerUserId,
          )
          .execute();

        /*
         * Global DKTURBO identity.
         *
         * Role owner deliberately gets implicit
         * app.training.access from Control Plane.
         */
        await controlDatabase
          .insertInto(
            'identity.users',
          )
          .values({
            id:
              ownerUserId,

            name:
              'Training HTTP Owner',

            role:
              'owner',

            created_at:
              new Date(),
          })
          .execute();

        /*
         * Training private data.
         *
         * Important: athlete_access is NOT inserted yet.
         * The first privacy test therefore exercises:
         *
         * owner
         *   -> app.training.access YES
         *   -> athlete_access NO
         */
        await trainingDatabase
          .insertInto(
            'training.athletes',
          )
          .values({
            id:
              athleteId,

            display_name:
              'HTTP Athlete',
          })
          .execute();

        await trainingDatabase
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
              'HTTP integration week',

            notes:
              null,

            created_by_user_id:
              ownerUserId,
          })
          .execute();

        await trainingDatabase
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

        await trainingDatabase
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
              'HTTP Session',

            planned_start_time:
              '10:00',

            planned_duration_minutes:
              60,

            actual_start_time:
              null,

            actual_duration_minutes:
              null,

            planned_notes:
              null,

            actual_notes:
              null,

            planned_rpe:
              '8',

            actual_rpe:
              null,

            external_id:
              null,

            created_by_user_id:
              ownerUserId,
          })
          .execute();

        await trainingDatabase
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
              'Fuerza',

            notes:
              null,
          })
          .execute();

        await trainingDatabase
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

        await trainingDatabase
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

        await trainingDatabase
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
          })
          .execute();
      },
    );

    afterAll(
      async () => {

        await app.close();

        await trainingDatabase
          .deleteFrom(
            'training.athletes',
          )
          .where(
            'id',
            '=',
            athleteId,
          )
          .execute();

        await trainingDatabase
          .deleteFrom(
            'training.exercise_catalog',
          )
          .where(
            'id',
            '=',
            exerciseId,
          )
          .execute();

        await controlDatabase
          .deleteFrom(
            'identity.users',
          )
          .where(
            'id',
            '=',
            ownerUserId,
          )
          .execute();

        await trainingDatabase.destroy();
        await controlDatabase.destroy();
      },
    );

    it(
      'returns 401 without an authenticated session',
      async () => {

        authenticatedUserId =
          null;

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/training/athletes/${athleteId}/sessions/${sessionId}`,
          });

        expect(
          response.statusCode,
        ).toBe(
          401,
        );

        expect(
          response.json(),
        ).toEqual({
          error:
            'authentication_required',
        });

        authenticatedUserId =
          ownerUserId;
      },
    );

    it(
      'denies an owner who has app access but no athlete access',
      async () => {

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/training/athletes/${athleteId}/sessions/${sessionId}`,
          });

        expect(
          response.statusCode,
        ).toBe(
          403,
        );

        expect(
          response.json(),
        ).toEqual({
          error:
            'athlete_access_denied',
        });
      },
    );

    it(
      'allows the same owner after explicit VIEWER athlete access',
      async () => {

        await trainingDatabase
          .insertInto(
            'training.athlete_access',
          )
          .values({
            id:
              athleteAccessId,

            athlete_id:
              athleteId,

            user_id:
              ownerUserId,

            role:
              'VIEWER',
          })
          .execute();

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/training/athletes/${athleteId}/sessions/${sessionId}`,
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        const body =
          response.json();

        expect(
          body.accessRole,
        ).toBe(
          'VIEWER',
        );

        expect(
          body.canWrite,
        ).toBe(
          false,
        );

        expect(
          body.session.id,
        ).toBe(
          sessionId,
        );

        expect(
          body.session.title,
        ).toBe(
          'HTTP Session',
        );

        expect(
          body.blocks,
        ).toHaveLength(
          1,
        );

        expect(
          body.blocks[0]
            .block.title,
        ).toBe(
          'Fuerza',
        );

        expect(
          body.blocks[0]
            .exercises[0]
            .catalogItem.name,
        ).toBe(
          'Sentadilla',
        );

        expect(
          body.blocks[0]
            .exercises[0]
            .performanceEntries[0]
            .plannedLoadKg,
        ).toBe(
          80,
        );

        expect(
          body.blocks[0]
            .exercises[0]
            .performanceEntries[0]
            .actualLoadKg,
        ).toBe(
          82.5,
        );
      },
    );
  },
);
