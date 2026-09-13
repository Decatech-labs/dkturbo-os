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

const otherAthleteId =
  'd2000000-0000-4000-8000-000000000002';

const athleteAccessId =
  'd2100000-0000-4000-8000-000000000001';

const weekId =
  'd3000000-0000-4000-8000-000000000001';

const otherWeekId =
  'd3000000-0000-4000-8000-000000000099';

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

    const setAthleteAccessRole =
      async (
        role:
          | 'SELF'
          | 'COACH'
          | 'VIEWER',
      ): Promise<void> => {
        await trainingDatabase
          .updateTable(
            'training.athlete_access',
          )
          .set({
            role,
          })
          .where(
            'athlete_id',
            '=',
            athleteId,
          )
          .where(
            'user_id',
            '=',
            ownerUserId,
          )
          .execute();
      };

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
            'training.athletes',
          )
          .where(
            'id',
            '=',
            otherAthleteId,
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
            'training.athletes',
          )
          .values({
            id:
              otherAthleteId,

            display_name:
              'Private HTTP Athlete',
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
            'training.weeks',
          )
          .values({
            id:
              otherWeekId,

            athlete_id:
              otherAthleteId,

            week_start:
              '2026-09-14',

            title:
              'Private HTTP week',

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
            'training.athletes',
          )
          .where(
            'id',
            '=',
            otherAthleteId,
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
      'returns no athletes to an owner without explicit athlete access',
      async () => {

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/training/athletes',
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        expect(
          response.json(),
        ).toEqual([]);
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
      'denies week creation to an owner without explicit athlete access',
      async () => {
        const response =
          await app.inject({
            method:
              'POST',

            url:
              `/api/training/athletes/${athleteId}/weeks`,

            payload: {
              weekStart:
                '2026-10-12',

              title:
                'Must not be created',

              notes:
                null,
            },
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

        const persisted =
          await trainingDatabase
            .selectFrom(
              'training.weeks',
            )
            .select('id')
            .where(
              'athlete_id',
              '=',
              athleteId,
            )
            .where(
              'week_start',
              '=',
              '2026-10-12',
            )
            .executeTakeFirst();

        expect(
          persisted,
        ).toBeUndefined();
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

    it(
      'lists only explicitly accessible athletes',
      async () => {

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/training/athletes',
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        const body =
          response.json();

        expect(
          body,
        ).toHaveLength(
          1,
        );

        expect(
          body,
        ).toHaveLength(
          1,
        );

        expect(
          body[0].athlete.id,
        ).toBe(
          athleteId,
        );

        expect(
          body[0].athlete.displayName,
        ).toBe(
          'HTTP Athlete',
        );

        expect(
          body[0].accessRole,
        ).toBe(
          'VIEWER',
        );

        expect(
          body[0].canWrite,
        ).toBe(
          false,
        );

        expect(
          body[0].athlete.displayName,
        ).toBe(
          'HTTP Athlete',
        );

        expect(
          body.some(
            (
              athlete:
                {
                  id:
                    string;
                },
            ) =>
              athlete.id ===
              otherAthleteId,
          ),
        ).toBe(
          false,
        );
      },
    );

    it(
      'lists weeks for an accessible athlete as read-only',
      async () => {

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/training/athletes/${athleteId}/weeks`,
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        const body =
          response.json();

        expect(
          body,
        ).toHaveLength(
          1,
        );

        expect(
          body[0].week.id,
        ).toBe(
          weekId,
        );

        expect(
          body[0].week.title,
        ).toBe(
          'HTTP integration week',
        );

        expect(
          body[0].accessRole,
        ).toBe(
          'VIEWER',
        );

        expect(
          body[0].canWrite,
        ).toBe(
          false,
        );
      },
    );

    it(
      'returns week navigation with days and sessions',
      async () => {

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/training/athletes/${athleteId}/weeks/${weekId}`,
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        const body =
          response.json();

        expect(
          body.week.id,
        ).toBe(
          weekId,
        );

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
          body.days,
        ).toHaveLength(
          1,
        );

        expect(
          body.days[0].day.id,
        ).toBe(
          dayId,
        );

        expect(
          body.days[0].day.date,
        ).toBe(
          '2026-09-09',
        );

        expect(
          body.days[0].sessions,
        ).toHaveLength(
          1,
        );

        expect(
          body.days[0].sessions[0].id,
        ).toBe(
          sessionId,
        );

        expect(
          body.days[0].sessions[0].title,
        ).toBe(
          'HTTP Session',
        );

        expect(
          body.days[0].sessions[0].plannedStartTime,
        ).toBe(
          '10:00',
        );
      },
    );

    it(
      'denies week listing for an athlete without explicit access',
      async () => {

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/training/athletes/${otherAthleteId}/weeks`,
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
      'does not reveal a week belonging to another athlete',
      async () => {

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/training/athletes/${athleteId}/weeks/${otherWeekId}`,
          });

        expect(
          response.statusCode,
        ).toBe(
          404,
        );

        expect(
          response.json(),
        ).toEqual({
          error:
            'training_week_not_found',
        });
      },
    );

    it(
      'rejects invalid Training route identifiers',
      async () => {

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/training/athletes/not-a-uuid/weeks',
          });

        expect(
          response.statusCode,
        ).toBe(
          400,
        );

        expect(
          response.json(),
        ).toEqual({
          error:
            'invalid_request',
        });
      },
    );

    it(
      'denies week creation to a VIEWER',
      async () => {
        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'POST',

            url:
              `/api/training/athletes/${athleteId}/weeks`,

            payload: {
              weekStart:
                '2026-10-05',

              title:
                'Viewer week',

              notes:
                null,
            },
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
      'creates a complete week for SELF access',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/weeks`,

              payload: {
                weekStart:
                  '2026-09-21',

                title:
                  'SELF training week',

                notes:
                  'Created through HTTP',
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            201,
          );

          const body =
            response.json();

          expect(
            body.week.athleteId,
          ).toBe(
            athleteId,
          );

          expect(
            body.week.weekStart,
          ).toBe(
            '2026-09-21',
          );

          expect(
            body.week.title,
          ).toBe(
            'SELF training week',
          );

          expect(
            body.days,
          ).toHaveLength(
            7,
          );

          expect(
            body.days.map(
              (
                day:
                  {
                    date:
                      string;
                  },
              ) =>
                day.date,
            ),
          ).toEqual([
            '2026-09-21',
            '2026-09-22',
            '2026-09-23',
            '2026-09-24',
            '2026-09-25',
            '2026-09-26',
            '2026-09-27',
          ]);

          const persistedWeek =
            await trainingDatabase
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
                '2026-09-21',
              )
              .executeTakeFirst();

          expect(
            persistedWeek,
          ).toBeDefined();

          const persistedDays =
            await trainingDatabase
              .selectFrom(
                'training.days',
              )
              .selectAll()
              .where(
                'week_id',
                '=',
                body.week.id,
              )
              .orderBy(
                'date',
                'asc',
              )
              .execute();

          expect(
            persistedDays,
          ).toHaveLength(
            7,
          );
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'creates a complete week for COACH access',
      async () => {
        await setAthleteAccessRole(
          'COACH',
        );

        try {
          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/weeks`,

              payload: {
                weekStart:
                  '2026-09-28',

                title:
                  'COACH training week',

                notes:
                  null,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            201,
          );

          const body =
            response.json();

          expect(
            body.week.athleteId,
          ).toBe(
            athleteId,
          );

          expect(
            body.week.weekStart,
          ).toBe(
            '2026-09-28',
          );

          expect(
            body.days,
          ).toHaveLength(
            7,
          );
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'rejects a week start that is not Monday',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/weeks`,

              payload: {
                weekStart:
                  '2026-09-22',

                title:
                  'Invalid week',

                notes:
                  null,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            400,
          );

          expect(
            response.json(),
          ).toEqual({
            error:
              'invalid_week_start',
          });

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.weeks',
              )
              .select('id')
              .where(
                'athlete_id',
                '=',
                athleteId,
              )
              .where(
                'week_start',
                '=',
                '2026-09-22',
              )
              .executeTakeFirst();

          expect(
            persisted,
          ).toBeUndefined();
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'returns conflict when the training week already exists',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/weeks`,

              payload: {
                weekStart:
                  '2026-09-21',

                title:
                  'Duplicate week',

                notes:
                  null,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            409,
          );

          expect(
            response.json(),
          ).toEqual({
            error:
              'training_week_already_exists',
          });

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.weeks',
              )
              .select('id')
              .where(
                'athlete_id',
                '=',
                athleteId,
              )
              .where(
                'week_start',
                '=',
                '2026-09-21',
              )
              .execute();

          expect(
            persisted,
          ).toHaveLength(
            1,
          );
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'denies session creation to a VIEWER',
      async () => {
        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'POST',

            url:
              `/api/training/athletes/${athleteId}/days/${dayId}/sessions`,

            payload: {
              type:
                'SWIMMING',

              title:
                'Viewer must not create',

              plannedStartTime:
                '09:00',

              plannedDurationMinutes:
                45,

              plannedNotes:
                null,

              plannedRpe:
                5,
            },
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
      'creates a planned session for SELF access',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/days/${dayId}/sessions`,

              payload: {
                type:
                  'SWIMMING',

                title:
                  'HTTP Swim Session',

                plannedStartTime:
                  '08:30',

                plannedDurationMinutes:
                  50,

                plannedNotes:
                  'Aerobic session',

                plannedRpe:
                  5,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            201,
          );

          const body =
            response.json();

          expect(
            body.athleteId,
          ).toBe(
            athleteId,
          );

          expect(
            body.dayId,
          ).toBe(
            dayId,
          );

          expect(
            body.type,
          ).toBe(
            'SWIMMING',
          );

          expect(
            body.title,
          ).toBe(
            'HTTP Swim Session',
          );

          expect(
            body.plannedStartTime,
          ).toBe(
            '08:30',
          );

          expect(
            body.plannedDurationMinutes,
          ).toBe(
            50,
          );

          expect(
            body.plannedRpe,
          ).toBe(
            5,
          );

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.sessions',
              )
              .selectAll()
              .where(
                'id',
                '=',
                body.id,
              )
              .executeTakeFirst();

          expect(
            persisted,
          ).toBeDefined();

          expect(
            persisted?.athlete_id,
          ).toBe(
            athleteId,
          );

          expect(
            persisted?.day_id,
          ).toBe(
            dayId,
          );
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'creates a planned session for COACH access',
      async () => {
        await setAthleteAccessRole(
          'COACH',
        );

        try {
          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/days/${dayId}/sessions`,

              payload: {
                type:
                  'STRENGTH',

                title:
                  'HTTP Coach Session',

                plannedStartTime:
                  '18:00',

                plannedDurationMinutes:
                  70,

                plannedNotes:
                  null,

                plannedRpe:
                  7,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            201,
          );

          const body =
            response.json();

          expect(
            body.type,
          ).toBe(
            'STRENGTH',
          );

          expect(
            body.title,
          ).toBe(
            'HTTP Coach Session',
          );

          expect(
            body.plannedDurationMinutes,
          ).toBe(
            70,
          );
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'rejects invalid session input',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/days/${dayId}/sessions`,

              payload: {
                type:
                  'SWIMMING',

                title:
                  'Invalid time',

                plannedStartTime:
                  '25:90',

                plannedDurationMinutes:
                  30,

                plannedNotes:
                  null,

                plannedRpe:
                  4,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            400,
          );

          expect(
            response.json(),
          ).toEqual({
            error:
              'invalid_session',
          });
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'rejects an invalid session type',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/days/${dayId}/sessions`,

              payload: {
                type:
                  'INVALID_TYPE',

                title:
                  'Invalid type',

                plannedStartTime:
                  '10:00',

                plannedDurationMinutes:
                  30,

                plannedNotes:
                  null,

                plannedRpe:
                  4,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            400,
          );

          expect(
            response.json(),
          ).toEqual({
            error:
              'invalid_request',
          });
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'hides a training day that belongs to another athlete',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        const otherDayId =
          'd4000000-0000-4000-8000-000000000099';

        try {
          await trainingDatabase
            .insertInto(
              'training.days',
            )
            .values({
              id:
                otherDayId,

              week_id:
                otherWeekId,

              athlete_id:
                otherAthleteId,

              date:
                '2026-09-14',

              notes:
                null,
            })
            .execute();

          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/days/${otherDayId}/sessions`,

              payload: {
                type:
                  'REHAB',

                title:
                  'Must stay private',

                plannedStartTime:
                  '11:00',

                plannedDurationMinutes:
                  30,

                plannedNotes:
                  null,

                plannedRpe:
                  3,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            404,
          );

          expect(
            response.json(),
          ).toEqual({
            error:
              'training_day_not_found',
          });
        } finally {
          await trainingDatabase
            .deleteFrom(
              'training.days',
            )
            .where(
              'id',
              '=',
              otherDayId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'denies week editing to a VIEWER',
      async () => {
        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'PATCH',

            url:
              `/api/training/athletes/${athleteId}/weeks/${weekId}`,

            payload: {
              title:
                'No permitido',

              notes:
                'No permitido',
            },
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
      'updates week metadata for SELF access',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const response =
            await app.inject({
              method:
                'PATCH',

              url:
                `/api/training/athletes/${athleteId}/weeks/${weekId}`,

              payload: {
                title:
                  'Semana modificada',

                notes:
                  'Objetivo actualizado',
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          const body =
            response.json();

          expect(
            body.title,
          ).toBe(
            'Semana modificada',
          );

          expect(
            body.notes,
          ).toBe(
            'Objetivo actualizado',
          );

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.weeks',
              )
              .select([
                'title',
                'notes',
              ])
              .where(
                'id',
                '=',
                weekId,
              )
              .executeTakeFirstOrThrow();

          expect(
            persisted,
          ).toEqual({
            title:
              'Semana modificada',

            notes:
              'Objetivo actualizado',
          });
        } finally {
          await trainingDatabase
            .updateTable(
              'training.weeks',
            )
            .set({
              title:
                'HTTP integration week',

              notes:
                null,
            })
            .where(
              'id',
              '=',
              weekId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'allows COACH to update week metadata',
      async () => {
        await setAthleteAccessRole(
          'COACH',
        );

        try {
          const response =
            await app.inject({
              method:
                'PATCH',

              url:
                `/api/training/athletes/${athleteId}/weeks/${weekId}`,

              payload: {
                title:
                  'Coach update',

                notes:
                  null,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          expect(
            response.json().title,
          ).toBe(
            'Coach update',
          );
        } finally {
          await trainingDatabase
            .updateTable(
              'training.weeks',
            )
            .set({
              title:
                'HTTP integration week',

              notes:
                null,
            })
            .where(
              'id',
              '=',
              weekId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'hides a week belonging to another athlete when editing',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const response =
            await app.inject({
              method:
                'PATCH',

              url:
                `/api/training/athletes/${athleteId}/weeks/${otherWeekId}`,

              payload: {
                title:
                  'Private',

                notes:
                  null,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            404,
          );

          expect(
            response.json(),
          ).toEqual({
            error:
              'training_week_not_found',
          });
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );
  },
);
