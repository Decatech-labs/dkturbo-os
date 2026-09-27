import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  randomUUID,
} from 'node:crypto';

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
      'updates and moves a planned session for SELF access',
      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const movableSessionId =
          'd5000000-0000-4000-8000-000000000091';

        const destinationDayId =
          'd4000000-0000-4000-8000-000000000091';

        try {

          await trainingDatabase
            .insertInto(
              'training.days',
            )
            .values({
              id:
                destinationDayId,

              week_id:
                weekId,

              athlete_id:
                athleteId,

              date:
                '2026-09-10',

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
                movableSessionId,

              day_id:
                dayId,

              athlete_id:
                athleteId,

              type:
                'STRENGTH',

              title:
                'Before update',

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
                '6',

              actual_rpe:
                null,

              external_id:
                null,

              created_by_user_id:
                ownerUserId,
            })
            .execute();

          const response =
            await app.inject({
              method:
                'PATCH',

              url:
                `/api/training/athletes/${athleteId}/sessions/${movableSessionId}`,

              payload: {
                dayId:
                  destinationDayId,

                type:
                  'RUNNING',

                title:
                  '  Series 6x200  ',

                plannedStartTime:
                  '18:30',

                plannedDurationMinutes:
                  75,

                plannedNotes:
                  'Recuperación completa',

                plannedRpe:
                  8,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          expect(
            response.json(),
          ).toMatchObject({
            id:
              movableSessionId,

            athleteId,

            dayId:
              destinationDayId,

            type:
              'RUNNING',

            title:
              'Series 6x200',

            plannedStartTime:
              '18:30',

            plannedDurationMinutes:
              75,

            plannedNotes:
              'Recuperación completa',

            plannedRpe:
              8,
          });

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.sessions',
              )
              .selectAll()
              .where(
                'id',
                '=',
                movableSessionId,
              )
              .executeTakeFirstOrThrow();

          expect(
            persisted.day_id,
          ).toBe(
            destinationDayId,
          );

          expect(
            persisted.type,
          ).toBe(
            'RUNNING',
          );

          expect(
            persisted.title,
          ).toBe(
            'Series 6x200',
          );

          expect(
            persisted.planned_start_time
              ?.slice(
                0,
                5,
              ),
          ).toBe(
            '18:30',
          );

        } finally {

          await trainingDatabase
            .deleteFrom(
              'training.sessions',
            )
            .where(
              'id',
              '=',
              movableSessionId,
            )
            .execute();

          await trainingDatabase
            .deleteFrom(
              'training.days',
            )
            .where(
              'id',
              '=',
              destinationDayId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

    it(
      'allows COACH to update a planned session',
      async () => {

        await setAthleteAccessRole(
          'COACH',
        );

        const coachSessionId =
          'd5000000-0000-4000-8000-000000000092';

        try {

          await trainingDatabase
            .insertInto(
              'training.sessions',
            )
            .values({
              id:
                coachSessionId,

              day_id:
                dayId,

              athlete_id:
                athleteId,

              type:
                'STRENGTH',

              title:
                'Coach original',

              planned_start_time:
                '12:00',

              planned_duration_minutes:
                45,

              actual_start_time:
                null,

              actual_duration_minutes:
                null,

              planned_notes:
                null,

              actual_notes:
                null,

              planned_rpe:
                '5',

              actual_rpe:
                null,

              external_id:
                null,

              created_by_user_id:
                ownerUserId,
            })
            .execute();

          const response =
            await app.inject({
              method:
                'PATCH',

              url:
                `/api/training/athletes/${athleteId}/sessions/${coachSessionId}`,

              payload: {
                dayId,

                type:
                  'REHAB',

                title:
                  'Coach update',

                plannedStartTime:
                  '13:15',

                plannedDurationMinutes:
                  35,

                plannedNotes:
                  'Controlado',

                plannedRpe:
                  4,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          expect(
            response.json(),
          ).toMatchObject({
            id:
              coachSessionId,

            type:
              'REHAB',

            title:
              'Coach update',

            plannedStartTime:
              '13:15',

            plannedDurationMinutes:
              35,

            plannedRpe:
              4,
          });

        } finally {

          await trainingDatabase
            .deleteFrom(
              'training.sessions',
            )
            .where(
              'id',
              '=',
              coachSessionId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

    it(
      'denies planned session update to VIEWER access',
      async () => {

        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'PATCH',

            url:
              `/api/training/athletes/${athleteId}/sessions/${sessionId}`,

            payload: {
              dayId,

              type:
                'STRENGTH',

              title:
                'Viewer must not edit',

              plannedStartTime:
                '10:00',

              plannedDurationMinutes:
                60,

              plannedNotes:
                null,

              plannedRpe:
                8,
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
      'rejects invalid planned session update',
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
                `/api/training/athletes/${athleteId}/sessions/${sessionId}`,

              payload: {
                dayId,

                type:
                  'STRENGTH',

                title:
                  'Invalid time',

                plannedStartTime:
                  '27:95',

                plannedDurationMinutes:
                  60,

                plannedNotes:
                  null,

                plannedRpe:
                  8,
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
      'hides a destination day belonging to another athlete when moving a session',
      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const privateDayId =
          'd4000000-0000-4000-8000-000000000093';

        try {

          await trainingDatabase
            .insertInto(
              'training.days',
            )
            .values({
              id:
                privateDayId,

              week_id:
                otherWeekId,

              athlete_id:
                otherAthleteId,

              date:
                '2026-09-15',

              notes:
                null,
            })
            .execute();

          const response =
            await app.inject({
              method:
                'PATCH',

              url:
                `/api/training/athletes/${athleteId}/sessions/${sessionId}`,

              payload: {
                dayId:
                  privateDayId,

                type:
                  'STRENGTH',

                title:
                  'Must remain private',

                plannedStartTime:
                  '10:00',

                plannedDurationMinutes:
                  60,

                plannedNotes:
                  null,

                plannedRpe:
                  8,
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
              privateDayId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

    it(
      'deletes a planned session and cascades its structure for SELF access',
      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const deletedSessionId =
          'd5000000-0000-4000-8000-000000000094';

        const deletedBlockId =
          'd6000000-0000-4000-8000-000000000094';

        const deletedSessionExerciseId =
          'd8000000-0000-4000-8000-000000000094';

        const deletedPerformanceEntryId =
          'd9000000-0000-4000-8000-000000000094';

        try {

          await trainingDatabase
            .insertInto(
              'training.sessions',
            )
            .values({
              id:
                deletedSessionId,

              day_id:
                dayId,

              athlete_id:
                athleteId,

              type:
                'STRENGTH',

              title:
                'Delete cascade',

              planned_start_time:
                '16:00',

              planned_duration_minutes:
                45,

              actual_start_time:
                null,

              actual_duration_minutes:
                null,

              planned_notes:
                null,

              actual_notes:
                null,

              planned_rpe:
                '7',

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
                deletedBlockId,

              session_id:
                deletedSessionId,

              athlete_id:
                athleteId,

              position:
                0,

              title:
                'Cascade block',

              notes:
                null,
            })
            .execute();

          await trainingDatabase
            .insertInto(
              'training.session_exercises',
            )
            .values({
              id:
                deletedSessionExerciseId,

              block_id:
                deletedBlockId,

              session_id:
                deletedSessionId,

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
                deletedPerformanceEntryId,

              session_exercise_id:
                deletedSessionExerciseId,

              athlete_id:
                athleteId,

              position:
                0,

              planned_reps:
                5,

              actual_reps:
                null,

              planned_load_kg:
                '70',

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
                '7',

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
            .execute();

          const response =
            await app.inject({
              method:
                'DELETE',

              url:
                `/api/training/athletes/${athleteId}/sessions/${deletedSessionId}`,
            });

          expect(
            response.statusCode,
          ).toBe(
            204,
          );

          const persistedSession =
            await trainingDatabase
              .selectFrom(
                'training.sessions',
              )
              .select('id')
              .where(
                'id',
                '=',
                deletedSessionId,
              )
              .executeTakeFirst();

          const persistedBlock =
            await trainingDatabase
              .selectFrom(
                'training.session_blocks',
              )
              .select('id')
              .where(
                'id',
                '=',
                deletedBlockId,
              )
              .executeTakeFirst();

          const persistedExercise =
            await trainingDatabase
              .selectFrom(
                'training.session_exercises',
              )
              .select('id')
              .where(
                'id',
                '=',
                deletedSessionExerciseId,
              )
              .executeTakeFirst();

          const persistedEntry =
            await trainingDatabase
              .selectFrom(
                'training.performance_entries',
              )
              .select('id')
              .where(
                'id',
                '=',
                deletedPerformanceEntryId,
              )
              .executeTakeFirst();

          expect(
            persistedSession,
          ).toBeUndefined();

          expect(
            persistedBlock,
          ).toBeUndefined();

          expect(
            persistedExercise,
          ).toBeUndefined();

          expect(
            persistedEntry,
          ).toBeUndefined();

        } finally {

          /*
           * Defensive cleanup if an assertion fails before
           * the DELETE route removes the temporary session.
           */
          await trainingDatabase
            .deleteFrom(
              'training.sessions',
            )
            .where(
              'id',
              '=',
              deletedSessionId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

    it(
      'denies session block creation to a VIEWER',
      async () => {
        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'POST',

            url:
              `/api/training/athletes/${athleteId}/sessions/${sessionId}/blocks`,

            payload: {
              position:
                1,

              title:
                'Viewer block',

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
      'creates and persists a session block for SELF access',
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
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/blocks`,

              payload: {
                position:
                  1,

                title:
                  '  SELF block  ',

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
            body,
          ).toMatchObject({
            athleteId,
            sessionId,
            position:
              1,
            title:
              'SELF block',
            notes:
              'Created through HTTP',
          });

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.session_blocks',
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
          ).toMatchObject({
            athlete_id:
              athleteId,
            session_id:
              sessionId,
            position:
              1,
            title:
              'SELF block',
            notes:
              'Created through HTTP',
          });
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'creates a session block for COACH access',
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
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/blocks`,

              payload: {
                position:
                  2,

                title:
                  'COACH block',

                notes:
                  null,
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            201,
          );

          expect(
            response.json(),
          ).toMatchObject({
            athleteId,
            sessionId,
            position:
              2,
            title:
              'COACH block',
            notes:
              null,
          });
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'rejects an empty session block title',
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
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/blocks`,

              payload: {
                position:
                  3,

                title:
                  '   ',

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
              'invalid_session_block',
          });
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'rejects an invalid session block position',
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
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/blocks`,

              payload: {
                position:
                  -1,

                title:
                  'Invalid position',

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
      'does not reveal a session belonging to another athlete',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        const privateDayId =
          randomUUID();

        const privateSessionId =
          randomUUID();

        try {
          await trainingDatabase
            .insertInto(
              'training.days',
            )
            .values({
              id:
                privateDayId,
              week_id:
                otherWeekId,
              athlete_id:
                otherAthleteId,
              date:
                '2026-09-15',
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
                privateSessionId,
              day_id:
                privateDayId,
              athlete_id:
                otherAthleteId,
              type:
                'STRENGTH',
              title:
                'Private HTTP Session',
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
                ownerUserId,
            })
            .execute();

          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/sessions/${privateSessionId}/blocks`,

              payload: {
                position:
                  0,

                title:
                  'Must stay private',

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
              'training_session_not_found',
          });

          const leakedBlock =
            await trainingDatabase
              .selectFrom(
                'training.session_blocks',
              )
              .select('id')
              .where(
                'session_id',
                '=',
                privateSessionId,
              )
              .executeTakeFirst();

          expect(
            leakedBlock,
          ).toBeUndefined();
        } finally {
          await trainingDatabase
            .deleteFrom(
              'training.sessions',
            )
            .where(
              'id',
              '=',
              privateSessionId,
            )
            .execute();

          await trainingDatabase
            .deleteFrom(
              'training.days',
            )
            .where(
              'id',
              '=',
              privateDayId,
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

    it(
      'searches active shared exercises and excludes archived exercises',
      async () => {
        const systemExerciseId =
          randomUUID();

        const customExerciseId =
          randomUUID();

        const archivedExerciseId =
          randomUUID();

        try {
          await trainingDatabase
            .insertInto(
              'training.exercise_catalog',
            )
            .values([
              {
                id:
                  systemExerciseId,

                name:
                  'HTTP Search System',

                category:
                  'Test',

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
              },
              {
                id:
                  customExerciseId,

                name:
                  'HTTP Search Custom',

                category:
                  'Test',

                sport:
                  null,

                metric_profile:
                  'GENERIC',

                origin:
                  'CUSTOM',

                created_by_user_id:
                  ownerUserId,

                archived_at:
                  null,
              },
              {
                id:
                  archivedExerciseId,

                name:
                  'HTTP Search Archived',

                category:
                  'Test',

                sport:
                  null,

                metric_profile:
                  'GENERIC',

                origin:
                  'SYSTEM',

                created_by_user_id:
                  null,

                archived_at:
                  new Date(),
              },
            ])
            .execute();

          const response =
            await app.inject({
              method:
                'GET',

              url:
                '/api/training/exercises?query=HTTP%20Search',
            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          const body =
            response.json() as Array<{
              id: string;
              name: string;
              origin: string;
            }>;

          expect(
            body.map(
              exercise =>
                exercise.id,
            ),
          ).toContain(
            systemExerciseId,
          );

          expect(
            body.map(
              exercise =>
                exercise.id,
            ),
          ).toContain(
            customExerciseId,
          );

          expect(
            body.map(
              exercise =>
                exercise.id,
            ),
          ).not.toContain(
            archivedExerciseId,
          );
        } finally {
          await trainingDatabase
            .deleteFrom(
              'training.exercise_catalog',
            )
            .where(
              'id',
              'in',
              [
                systemExerciseId,
                customExerciseId,
                archivedExerciseId,
              ],
            )
            .execute();
        }
      },
    );

    it(
      'denies adding an exercise to a block for VIEWER access',
      async () => {
        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'POST',

            url:
              `/api/training/athletes/${athleteId}/blocks/${blockId}/exercises`,

            payload: {
              position:
                50,

              existingExerciseId:
                exerciseId,

              plannedNotes:
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
      'adds an existing exercise to a block for SELF access',
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
                `/api/training/athletes/${athleteId}/blocks/${blockId}/exercises`,

              payload: {
                position:
                  50,

                existingExerciseId:
                  exerciseId,

                plannedNotes:
                  'HTTP existing exercise',
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
            body.createdExercise,
          ).toBe(
            false,
          );

          expect(
            body.exercise.id,
          ).toBe(
            exerciseId,
          );

          expect(
            body.sessionExercise.blockId,
          ).toBe(
            blockId,
          );

          expect(
            body.sessionExercise.position,
          ).toBe(
            50,
          );

          expect(
            body.sessionExercise.plannedNotes,
          ).toBe(
            'HTTP existing exercise',
          );

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.session_exercises',
              )
              .selectAll()
              .where(
                'id',
                '=',
                body.sessionExercise.id,
              )
              .executeTakeFirst();

          expect(
            persisted,
          ).toBeDefined();

          expect(
            persisted?.exercise_id,
          ).toBe(
            exerciseId,
          );

          expect(
            persisted?.block_id,
          ).toBe(
            blockId,
          );
        } finally {
          await trainingDatabase
            .deleteFrom(
              'training.session_exercises',
            )
            .where(
              'block_id',
              '=',
              blockId,
            )
            .where(
              'position',
              '=',
              50,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'creates and adds a custom exercise for COACH access',
      async () => {
        await setAthleteAccessRole(
          'COACH',
        );

        let createdExerciseId:
          string | null =
            null;

        try {
          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/blocks/${blockId}/exercises`,

              payload: {
                position:
                  51,

                manualExercise: {
                  name:
                    'HTTP Custom Exercise',

                  category:
                    'Técnica',

                  sport:
                    'Atletismo',

                  metricProfile:
                    'GENERIC',
                },

                plannedNotes:
                  'Created from HTTP',
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            201,
          );

          const body =
            response.json();

          createdExerciseId =
            body.exercise.id;

          expect(
            body.createdExercise,
          ).toBe(
            true,
          );

          expect(
            body.exercise.name,
          ).toBe(
            'HTTP Custom Exercise',
          );

          expect(
            body.exercise.origin,
          ).toBe(
            'CUSTOM',
          );

          expect(
            body.exercise.createdByUserId,
          ).toBe(
            ownerUserId,
          );

          expect(
            body.sessionExercise.position,
          ).toBe(
            51,
          );

          const persistedExercise =
            await trainingDatabase
              .selectFrom(
                'training.exercise_catalog',
              )
              .selectAll()
              .where(
                'id',
                '=',
                createdExerciseId,
              )
              .executeTakeFirstOrThrow();

          expect(
            persistedExercise.origin,
          ).toBe(
            'CUSTOM',
          );

          expect(
            persistedExercise.created_by_user_id,
          ).toBe(
            ownerUserId,
          );
        } finally {
          await trainingDatabase
            .deleteFrom(
              'training.session_exercises',
            )
            .where(
              'block_id',
              '=',
              blockId,
            )
            .where(
              'position',
              '=',
              51,
            )
            .execute();

          if (createdExerciseId) {
            await trainingDatabase
              .deleteFrom(
                'training.exercise_catalog',
              )
              .where(
                'id',
                '=',
                createdExerciseId,
              )
              .execute();
          }

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'rejects an empty manual exercise name',
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
                `/api/training/athletes/${athleteId}/blocks/${blockId}/exercises`,

              payload: {
                position:
                  52,

                manualExercise: {
                  name:
                    '   ',

                  category:
                    null,

                  sport:
                    null,

                  metricProfile:
                    'GENERIC',
                },

                plannedNotes:
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
              'invalid_exercise',
          });
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'rejects a negative exercise position',
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
                `/api/training/athletes/${athleteId}/blocks/${blockId}/exercises`,

              payload: {
                position:
                  -1,

                existingExerciseId:
                  exerciseId,

                plannedNotes:
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
      'hides a block belonging to another athlete',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        const privateDayId =
          randomUUID();

        const privateSessionId =
          randomUUID();

        const privateBlockId =
          randomUUID();

        try {
          await trainingDatabase
            .insertInto(
              'training.days',
            )
            .values({
              id:
                privateDayId,

              week_id:
                otherWeekId,

              athlete_id:
                otherAthleteId,

              date:
                '2026-10-01',

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
                privateSessionId,

              day_id:
                privateDayId,

              athlete_id:
                otherAthleteId,

              type:
                'STRENGTH',

              title:
                'Private exercise session',

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
                ownerUserId,
            })
            .execute();

          await trainingDatabase
            .insertInto(
              'training.session_blocks',
            )
            .values({
              id:
                privateBlockId,

              session_id:
                privateSessionId,

              athlete_id:
                otherAthleteId,

              position:
                0,

              title:
                'Private block',

              notes:
                null,
            })
            .execute();

          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/blocks/${privateBlockId}/exercises`,

              payload: {
                position:
                  0,

                existingExerciseId:
                  exerciseId,

                plannedNotes:
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
              'training_block_not_found',
          });

          const leakedWrite =
            await trainingDatabase
              .selectFrom(
                'training.session_exercises',
              )
              .select('id')
              .where(
                'block_id',
                '=',
                privateBlockId,
              )
              .execute();

          expect(
            leakedWrite,
          ).toHaveLength(
            0,
          );
        } finally {
          await trainingDatabase
            .deleteFrom(
              'training.session_blocks',
            )
            .where(
              'id',
              '=',
              privateBlockId,
            )
            .execute();

          await trainingDatabase
            .deleteFrom(
              'training.sessions',
            )
            .where(
              'id',
              '=',
              privateSessionId,
            )
            .execute();

          await trainingDatabase
            .deleteFrom(
              'training.days',
            )
            .where(
              'id',
              '=',
              privateDayId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'denies performance entry creation to VIEWER access',
      async () => {
        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'POST',

            url:
              `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}/performance-entries`,

            payload: {
              position:
                70,

              planned: {
                reps:
                  8,

                loadKg:
                  80,

                distanceM:
                  null,

                durationMs:
                  null,

                resultM:
                  null,

                heightM:
                  null,

                rpe:
                  7,

                rir:
                  2,

                restSeconds:
                  120,

                notes:
                  null,
              },
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
      'creates a planned performance entry for SELF access',
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
                `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}/performance-entries`,

              payload: {
                position:
                  70,

                planned: {
                  reps:
                    8,

                  loadKg:
                    82.5,

                  distanceM:
                    null,

                  durationMs:
                    null,

                  resultM:
                    null,

                  heightM:
                    null,

                  rpe:
                    7,

                  rir:
                    2,

                  restSeconds:
                    120,

                  notes:
                    'Serie HTTP',
                },
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
            body.sessionExerciseId,
          ).toBe(
            sessionExerciseId,
          );

          expect(
            body.position,
          ).toBe(
            70,
          );

          expect(
            body.plannedReps,
          ).toBe(
            8,
          );

          expect(
            body.plannedLoadKg,
          ).toBe(
            82.5,
          );

          expect(
            body.plannedRpe,
          ).toBe(
            7,
          );

          expect(
            body.plannedRir,
          ).toBe(
            2,
          );

          expect(
            body.plannedRestSeconds,
          ).toBe(
            120,
          );

          expect(
            body.actualReps,
          ).toBeNull();

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.performance_entries',
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
            persisted?.session_exercise_id,
          ).toBe(
            sessionExerciseId,
          );

          expect(
            persisted?.planned_reps,
          ).toBe(
            8,
          );

          expect(
            Number(
              persisted
                ?.planned_load_kg,
            ),
          ).toBe(
            82.5,
          );
        } finally {
          await trainingDatabase
            .deleteFrom(
              'training.performance_entries',
            )
            .where(
              'session_exercise_id',
              '=',
              sessionExerciseId,
            )
            .where(
              'position',
              '=',
              70,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'creates a planned performance entry for COACH access',
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
                `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}/performance-entries`,

              payload: {
                position:
                  71,

                planned: {
                  reps:
                    null,

                  loadKg:
                    null,

                  distanceM:
                    200,

                  durationMs:
                    32000,

                  resultM:
                    null,

                  heightM:
                    null,

                  rpe:
                    6,

                  rir:
                    null,

                  restSeconds:
                    90,

                  notes:
                    'Intervalo HTTP',
                },
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
            body.position,
          ).toBe(
            71,
          );

          expect(
            body.plannedDistanceM,
          ).toBe(
            200,
          );

          expect(
            body.plannedDurationMs,
          ).toBe(
            32000,
          );

          expect(
            body.plannedRestSeconds,
          ).toBe(
            90,
          );
        } finally {
          await trainingDatabase
            .deleteFrom(
              'training.performance_entries',
            )
            .where(
              'session_exercise_id',
              '=',
              sessionExerciseId,
            )
            .where(
              'position',
              '=',
              71,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'rejects invalid planned performance metrics',
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
                `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}/performance-entries`,

              payload: {
                position:
                  72,

                planned: {
                  reps:
                    8,

                  loadKg:
                    80,

                  distanceM:
                    null,

                  durationMs:
                    null,

                  resultM:
                    null,

                  heightM:
                    null,

                  rpe:
                    11,

                  rir:
                    2,

                  restSeconds:
                    120,

                  notes:
                    null,
                },
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
              'invalid_performance_entry',
          });
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'returns 404 for an unknown session exercise',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const unknownSessionExerciseId =
            randomUUID();

          const response =
            await app.inject({
              method:
                'POST',

              url:
                `/api/training/athletes/${athleteId}/session-exercises/${unknownSessionExerciseId}/performance-entries`,

              payload: {
                position:
                  0,

                planned: {
                  reps:
                    8,

                  loadKg:
                    null,

                  distanceM:
                    null,

                  durationMs:
                    null,

                  resultM:
                    null,

                  heightM:
                    null,

                  rpe:
                    null,

                  rir:
                    null,

                  restSeconds:
                    null,

                  notes:
                    null,
                },
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
              'training_session_exercise_not_found',
          });
        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'updates a planned performance entry for SELF access',
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
                `/api/training/athletes/${athleteId}/performance-entries/${performanceEntryId}`,

              payload: {
                planned: {
                  reps:
                    8,

                  loadKg:
                    85,

                  distanceM:
                    null,

                  durationMs:
                    null,

                  resultM:
                    null,

                  heightM:
                    null,

                  rpe:
                    7.5,

                  rir:
                    1,

                  restSeconds:
                    150,

                  notes:
                    'Editado por HTTP',
                },
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
            body.id,
          ).toBe(
            performanceEntryId,
          );

          expect(
            body.plannedReps,
          ).toBe(
            8,
          );

          expect(
            body.plannedLoadKg,
          ).toBe(
            85,
          );

          expect(
            body.plannedRpe,
          ).toBe(
            7.5,
          );

          expect(
            body.plannedRir,
          ).toBe(
            1,
          );

          expect(
            body.plannedRestSeconds,
          ).toBe(
            150,
          );

          expect(
            body.plannedNotes,
          ).toBe(
            'Editado por HTTP',
          );

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.performance_entries',
              )
              .selectAll()
              .where(
                'id',
                '=',
                performanceEntryId,
              )
              .executeTakeFirst();

          expect(
            persisted?.planned_reps,
          ).toBe(
            8,
          );

          expect(
            Number(
              persisted?.planned_load_kg,
            ),
          ).toBe(
            85,
          );

          expect(
            Number(
              persisted?.planned_rpe,
            ),
          ).toBe(
            7.5,
          );

          expect(
            Number(
              persisted?.planned_rir,
            ),
          ).toBe(
            1,
          );

          expect(
            persisted?.planned_rest_seconds,
          ).toBe(
            150,
          );

          expect(
            persisted?.planned_notes,
          ).toBe(
            'Editado por HTTP',
          );

        } finally {
          await trainingDatabase
            .updateTable(
              'training.performance_entries',
            )
            .set({
              planned_reps:
                6,

              planned_load_kg:
                '80',

              planned_distance_m:
                null,

              planned_duration_ms:
                null,

              planned_result_m:
                null,

              planned_height_m:
                null,

              planned_rpe:
                '8',

              planned_rir:
                null,

              planned_rest_seconds:
                180,

              planned_metrics:
                {},

              planned_notes:
                null,
            })
            .where(
              'id',
              '=',
              performanceEntryId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'updates a planned performance entry for COACH access',
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
                `/api/training/athletes/${athleteId}/performance-entries/${performanceEntryId}`,

              payload: {
                planned: {
                  reps:
                    7,

                  loadKg:
                    82.5,

                  distanceM:
                    null,

                  durationMs:
                    null,

                  resultM:
                    null,

                  heightM:
                    null,

                  rpe:
                    8,

                  rir:
                    2,

                  restSeconds:
                    180,

                  notes:
                    'Coach edit',
                },
              },
            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          expect(
            response.json(),
          ).toEqual(
            expect.objectContaining({
              id:
                performanceEntryId,

              plannedReps:
                7,

              plannedLoadKg:
                82.5,

              plannedNotes:
                'Coach edit',
            }),
          );

        } finally {
          await trainingDatabase
            .updateTable(
              'training.performance_entries',
            )
            .set({
              planned_reps:
                6,

              planned_load_kg:
                '80',

              planned_rpe:
                '8',

              planned_rir:
                null,

              planned_rest_seconds:
                180,

              planned_metrics:
                {},

              planned_notes:
                null,
            })
            .where(
              'id',
              '=',
              performanceEntryId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'denies planned performance entry update to VIEWER access',
      async () => {
        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'PATCH',

            url:
              `/api/training/athletes/${athleteId}/performance-entries/${performanceEntryId}`,

            payload: {
              planned: {
                reps:
                  8,

                loadKg:
                  80,

                distanceM:
                  null,

                durationMs:
                  null,

                resultM:
                  null,

                heightM:
                  null,

                rpe:
                  7,

                rir:
                  2,

                restSeconds:
                  120,

                notes:
                  null,
              },
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
      'rejects invalid planned performance entry update',
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
                `/api/training/athletes/${athleteId}/performance-entries/${performanceEntryId}`,

              payload: {
                planned: {
                  reps:
                    8,

                  loadKg:
                    80,

                  distanceM:
                    null,

                  durationMs:
                    null,

                  resultM:
                    null,

                  heightM:
                    null,

                  rpe:
                    11,

                  rir:
                    2,

                  restSeconds:
                    120,

                  notes:
                    null,
                },
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
              'invalid_performance_entry',
          });

        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'returns 404 when updating an unknown performance entry',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const unknownPerformanceEntryId =
            randomUUID();

          const response =
            await app.inject({
              method:
                'PATCH',

              url:
                `/api/training/athletes/${athleteId}/performance-entries/${unknownPerformanceEntryId}`,

              payload: {
                planned: {
                  reps:
                    8,

                  loadKg:
                    null,

                  distanceM:
                    null,

                  durationMs:
                    null,

                  resultM:
                    null,

                  heightM:
                    null,

                  rpe:
                    null,

                  rir:
                    null,

                  restSeconds:
                    null,

                  notes:
                    null,
                },
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
              'training_performance_entry_not_found',
          });

        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'deletes a performance entry for SELF access',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        const entryId =
          randomUUID();

        await trainingDatabase
          .insertInto(
            'training.performance_entries',
          )
          .values({
            id:
              entryId,

            session_exercise_id:
              sessionExerciseId,

            athlete_id:
              athleteId,

            position:
              80,

            planned_reps:
              5,

            actual_reps:
              null,

            planned_load_kg:
              '60',

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
              '6',

            actual_rpe:
              null,

            planned_rir:
              null,

            actual_rir:
              null,

            planned_rest_seconds:
              120,

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
              'Delete me',

            actual_notes:
              null,
          })
          .execute();

        try {
          const response =
            await app.inject({
              method:
                'DELETE',

              url:
                `/api/training/athletes/${athleteId}/performance-entries/${entryId}`,
            });

          expect(
            response.statusCode,
          ).toBe(
            204,
          );

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.performance_entries',
              )
              .select('id')
              .where(
                'id',
                '=',
                entryId,
              )
              .executeTakeFirst();

          expect(
            persisted,
          ).toBeUndefined();

        } finally {
          await trainingDatabase
            .deleteFrom(
              'training.performance_entries',
            )
            .where(
              'id',
              '=',
              entryId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'deletes a performance entry for COACH access',
      async () => {
        await setAthleteAccessRole(
          'COACH',
        );

        const entryId =
          randomUUID();

        await trainingDatabase
          .insertInto(
            'training.performance_entries',
          )
          .values({
            id:
              entryId,

            session_exercise_id:
              sessionExerciseId,

            athlete_id:
              athleteId,

            position:
              81,

            planned_reps:
              4,

            actual_reps:
              null,

            planned_load_kg:
              '50',

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
          .execute();

        try {
          const response =
            await app.inject({
              method:
                'DELETE',

              url:
                `/api/training/athletes/${athleteId}/performance-entries/${entryId}`,
            });

          expect(
            response.statusCode,
          ).toBe(
            204,
          );

        } finally {
          await trainingDatabase
            .deleteFrom(
              'training.performance_entries',
            )
            .where(
              'id',
              '=',
              entryId,
            )
            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'denies performance entry deletion to VIEWER access',
      async () => {
        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'DELETE',

            url:
              `/api/training/athletes/${athleteId}/performance-entries/${performanceEntryId}`,
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
              'training.performance_entries',
            )
            .select('id')
            .where(
              'id',
              '=',
              performanceEntryId,
            )
            .executeTakeFirst();

        expect(
          persisted,
        ).toBeDefined();
      },
    );

    it(
      'returns 404 when deleting an unknown performance entry',
      async () => {
        await setAthleteAccessRole(
          'SELF',
        );

        try {
          const unknownPerformanceEntryId =
            randomUUID();

          const response =
            await app.inject({
              method:
                'DELETE',

              url:
                `/api/training/athletes/${athleteId}/performance-entries/${unknownPerformanceEntryId}`,
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
              'training_performance_entry_not_found',
          });

        } finally {
          await setAthleteAccessRole(
            'VIEWER',
          );
        }
      },
    );

    it(
      'reorders performance entries for SELF access and persists positions',

      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const firstExtraId =
          randomUUID();

        const secondExtraId =
          randomUUID();

        const insertEntry =
          async (
            id:
              string,
            position:
              number,
          ) => {

            await trainingDatabase

              .insertInto(
                'training.performance_entries',
              )

              .values({

                id,

                session_exercise_id:
                  sessionExerciseId,

                athlete_id:
                  athleteId,

                position,

                planned_reps:
                  5,

                actual_reps:
                  null,

                planned_load_kg:
                  '60',

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
                  '6',

                actual_rpe:
                  null,

                planned_rir:
                  null,

                actual_rir:
                  null,

                planned_rest_seconds:
                  120,

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

              .execute();

          };

        await insertEntry(
          firstExtraId,
          90,
        );

        await insertEntry(
          secondExtraId,
          91,
        );

        try {

          const response =

            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}/performance-entries/order`,

              payload: {

                orderedIds: [
                  secondExtraId,
                  performanceEntryId,
                  firstExtraId,
                ],

              },

            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          const body =
            response.json() as {

              entries: Array<{

                id:
                  string;

                position:
                  number;

              }>;

            };

          expect(
            body.entries.map(
              entry => ({
                id:
                  entry.id,

                position:
                  entry.position,
              }),
            ),
          ).toEqual([

            {
              id:
                secondExtraId,

              position:
                0,
            },

            {
              id:
                performanceEntryId,

              position:
                1,
            },

            {
              id:
                firstExtraId,

              position:
                2,
            },

          ]);

          const persisted =

            await trainingDatabase

              .selectFrom(
                'training.performance_entries',
              )

              .select([
                'id',
                'position',
              ])

              .where(
                'session_exercise_id',
                '=',
                sessionExerciseId,
              )

              .orderBy(
                'position',
                'asc',
              )

              .execute();

          expect(
            persisted.map(
              entry => ({
                id:
                  entry.id,

                position:
                  entry.position,
              }),
            ),
          ).toEqual([

            {
              id:
                secondExtraId,

              position:
                0,
            },

            {
              id:
                performanceEntryId,

              position:
                1,
            },

            {
              id:
                firstExtraId,

              position:
                2,
            },

          ]);

        } finally {

          await trainingDatabase

            .deleteFrom(
              'training.performance_entries',
            )

            .where(
              'id',
              'in',
              [
                firstExtraId,
                secondExtraId,
              ],
            )

            .execute();

          await trainingDatabase

            .updateTable(
              'training.performance_entries',
            )

            .set({
              position:
                0,
            })

            .where(
              'id',
              '=',
              performanceEntryId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'reorders performance entries for COACH access',

      async () => {

        await setAthleteAccessRole(
          'COACH',
        );

        try {

          const response =

            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}/performance-entries/order`,

              payload: {

                orderedIds: [
                  performanceEntryId,
                ],

              },

            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          expect(
            response.json(),
          ).toMatchObject({

            entries: [
              {
                id:
                  performanceEntryId,

                position:
                  0,
              },
            ],

          });

        } finally {

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'denies performance entry reorder to VIEWER access',

      async () => {

        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =

          await app.inject({

            method:
              'PUT',

            url:
              `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}/performance-entries/order`,

            payload: {

              orderedIds: [
                performanceEntryId,
              ],

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
      'rejects duplicate ids when reordering performance entries',

      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        try {

          const response =

            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}/performance-entries/order`,

              payload: {

                orderedIds: [
                  performanceEntryId,
                  performanceEntryId,
                ],

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
              'invalid_performance_entry_order',

          });

        } finally {

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'rejects an incomplete performance entry order',

      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const extraEntryId =
          randomUUID();

        await trainingDatabase

          .insertInto(
            'training.performance_entries',
          )

          .values({

            id:
              extraEntryId,

            session_exercise_id:
              sessionExerciseId,

            athlete_id:
              athleteId,

            position:
              90,

            planned_reps:
              5,

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

          .execute();

        try {

          const response =

            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}/performance-entries/order`,

              payload: {

                orderedIds: [
                  performanceEntryId,
                ],

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
              'invalid_performance_entry_order',

          });

        } finally {

          await trainingDatabase

            .deleteFrom(
              'training.performance_entries',
            )

            .where(
              'id',
              '=',
              extraEntryId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

        it(
      'updates a session block for SELF access',

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
                `/api/training/athletes/${athleteId}/blocks/${blockId}`,

              payload: {

                title:
                  '  Fuerza principal  ',

                notes:
                  '  Trabajo pesado  ',

              },

            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          expect(
            response.json(),
          ).toMatchObject({

            id:
              blockId,

            athleteId,

            sessionId,

            title:
              'Fuerza principal',

            notes:
              'Trabajo pesado',

          });

          const persisted =

            await trainingDatabase

              .selectFrom(
                'training.session_blocks',
              )

              .select([
                'title',
                'notes',
              ])

              .where(
                'id',
                '=',
                blockId,
              )

              .executeTakeFirst();

          expect(
            persisted,
          ).toEqual({

            title:
              'Fuerza principal',

            notes:
              'Trabajo pesado',

          });

        } finally {

          await trainingDatabase

            .updateTable(
              'training.session_blocks',
            )

            .set({

              title:
                'Fuerza',

              notes:
                null,

            })

            .where(
              'id',
              '=',
              blockId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'allows COACH to update a session block',

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
                `/api/training/athletes/${athleteId}/blocks/${blockId}`,

              payload: {

                title:
                  'Fuerza coach',

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
            response.json(),
          ).toMatchObject({

            id:
              blockId,

            title:
              'Fuerza coach',

            notes:
              null,

          });

        } finally {

          await trainingDatabase

            .updateTable(
              'training.session_blocks',
            )

            .set({

              title:
                'Fuerza',

              notes:
                null,

            })

            .where(
              'id',
              '=',
              blockId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'denies session block update to VIEWER access',

      async () => {

        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =

          await app.inject({

            method:
              'PATCH',

            url:
              `/api/training/athletes/${athleteId}/blocks/${blockId}`,

            payload: {

              title:
                'No permitido',

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
      'rejects an empty session block title',

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
                `/api/training/athletes/${athleteId}/blocks/${blockId}`,

              payload: {

                title:
                  '   ',

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
              'invalid_session_block',

          });

        } finally {

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'deletes a session block for SELF access',

      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const temporaryBlockId =
          randomUUID();

        await trainingDatabase

          .insertInto(
            'training.session_blocks',
          )

          .values({

            id:
              temporaryBlockId,

            session_id:
              sessionId,

            athlete_id:
              athleteId,

            position:
              90,

            title:
              'Bloque temporal',

            notes:
              null,

          })

          .execute();

        try {

          const response =

            await app.inject({

              method:
                'DELETE',

              url:
                `/api/training/athletes/${athleteId}/blocks/${temporaryBlockId}`,

            });

          expect(
            response.statusCode,
          ).toBe(
            204,
          );

          const persisted =

            await trainingDatabase

              .selectFrom(
                'training.session_blocks',
              )

              .select(
                'id',
              )

              .where(
                'id',
                '=',
                temporaryBlockId,
              )

              .executeTakeFirst();

          expect(
            persisted,
          ).toBeUndefined();

        } finally {

          await trainingDatabase

            .deleteFrom(
              'training.session_blocks',
            )

            .where(
              'id',
              '=',
              temporaryBlockId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'allows COACH to delete a session block',

      async () => {

        await setAthleteAccessRole(
          'COACH',
        );

        const temporaryBlockId =
          randomUUID();

        await trainingDatabase

          .insertInto(
            'training.session_blocks',
          )

          .values({

            id:
              temporaryBlockId,

            session_id:
              sessionId,

            athlete_id:
              athleteId,

            position:
              91,

            title:
              'Bloque temporal coach',

            notes:
              null,

          })

          .execute();

        try {

          const response =

            await app.inject({

              method:
                'DELETE',

              url:
                `/api/training/athletes/${athleteId}/blocks/${temporaryBlockId}`,

            });

          expect(
            response.statusCode,
          ).toBe(
            204,
          );

        } finally {

          await trainingDatabase

            .deleteFrom(
              'training.session_blocks',
            )

            .where(
              'id',
              '=',
              temporaryBlockId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'denies session block deletion to VIEWER access',

      async () => {

        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =

          await app.inject({

            method:
              'DELETE',

            url:
              `/api/training/athletes/${athleteId}/blocks/${blockId}`,

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
      'returns 404 when deleting an unknown session block',

      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        try {

          const response =

            await app.inject({

              method:
                'DELETE',

              url:
                `/api/training/athletes/${athleteId}/blocks/${randomUUID()}`,

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
              'training_block_not_found',

          });

        } finally {

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'reorders session blocks for SELF access and persists positions',

      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const secondBlockId =
          randomUUID();

        const thirdBlockId =
          randomUUID();

        await trainingDatabase

          .insertInto(
            'training.session_blocks',
          )

          .values([
            {

              id:
                secondBlockId,

              session_id:
                sessionId,

              athlete_id:
                athleteId,

              position:
                90,

              title:
                'Bloque 2',

              notes:
                null,

            },
            {

              id:
                thirdBlockId,

              session_id:
                sessionId,

              athlete_id:
                athleteId,

              position:
                91,

              title:
                'Bloque 3',

              notes:
                null,

            },
          ])

          .execute();

        try {

          const currentBlocks =

            await trainingDatabase

              .selectFrom(
                'training.session_blocks',
              )

              .select([
                'id',
                'position',
              ])

              .where(
                'session_id',
                '=',
                sessionId,
              )

              .orderBy(
                'position',
                'asc',
              )

              .execute();

          const remainingIds =

            currentBlocks

              .map(
                block =>
                  block.id,
              )

              .filter(
                id =>
                  id !== blockId &&
                  id !== secondBlockId &&
                  id !== thirdBlockId,
              );

          const orderedIds = [
            thirdBlockId,
            blockId,
            secondBlockId,
            ...remainingIds,
          ];

          const response =

            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/blocks/order`,

              payload: {

                orderedIds,

              },

            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          const body =
            response.json() as {

              blocks: Array<{

                id:
                  string;

                position:
                  number;

              }>;

            };

          expect(
            body.blocks.map(
              block =>
                block.id,
            ),
          ).toEqual(
            orderedIds,
          );

          expect(
            body.blocks.map(
              block =>
                block.position,
            ),
          ).toEqual(
            orderedIds.map(
              (
                _,
                index,
              ) =>
                index,
            ),
          );

          const persisted =

            await trainingDatabase

              .selectFrom(
                'training.session_blocks',
              )

              .select([
                'id',
                'position',
              ])

              .where(
                'session_id',
                '=',
                sessionId,
              )

              .orderBy(
                'position',
                'asc',
              )

              .execute();

          expect(
            persisted.map(
              block =>
                block.id,
            ),
          ).toEqual(
            orderedIds,
          );

          expect(
            persisted.map(
              block =>
                block.position,
            ),
          ).toEqual(
            orderedIds.map(
              (
                _,
                index,
              ) =>
                index,
            ),
          );

        } finally {

          await trainingDatabase

            .deleteFrom(
              'training.session_blocks',
            )

            .where(
              'id',
              'in',
              [
                secondBlockId,
                thirdBlockId,
              ],
            )

            .execute();

          await trainingDatabase

            .updateTable(
              'training.session_blocks',
            )

            .set({

              position:
                0,

            })

            .where(
              'id',
              '=',
              blockId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'allows COACH to reorder session blocks',

      async () => {

        await setAthleteAccessRole(
          'COACH',
        );

        try {

          const currentBlocks =

            await trainingDatabase

              .selectFrom(
                'training.session_blocks',
              )

              .select(
                'id',
              )

              .where(
                'session_id',
                '=',
                sessionId,
              )

              .orderBy(
                'position',
                'asc',
              )

              .execute();

          const orderedIds =

            currentBlocks.map(
              block =>
                block.id,
            );

          const response =

            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/blocks/order`,

              payload: {

                orderedIds,

              },

            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          const body =
            response.json() as {

              blocks: Array<{

                id:
                  string;

                position:
                  number;

              }>;

            };

          expect(
            body.blocks.map(
              block =>
                block.id,
            ),
          ).toEqual(
            orderedIds,
          );

        } finally {

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'denies session block reorder to VIEWER access',

      async () => {

        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =

          await app.inject({

            method:
              'PUT',

            url:
              `/api/training/athletes/${athleteId}/sessions/${sessionId}/blocks/order`,

            payload: {

              orderedIds: [
                blockId,
              ],

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
      'rejects duplicate ids when reordering session blocks',

      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        try {

          const response =

            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/blocks/order`,

              payload: {

                orderedIds: [
                  blockId,
                  blockId,
                ],

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
              'invalid_session_block_order',

          });

        } finally {

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );

    it(
      'rejects an incomplete session block order',

      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const temporaryBlockId =
          randomUUID();

        await trainingDatabase

          .insertInto(
            'training.session_blocks',
          )

          .values({

            id:
              temporaryBlockId,

            session_id:
              sessionId,

            athlete_id:
              athleteId,

            position:
              90,

            title:
              'Bloque extra',

            notes:
              null,

          })

          .execute();

        try {

          const response =

            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/blocks/order`,

              payload: {

                orderedIds: [
                  blockId,
                ],

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
              'invalid_session_block_order',

          });

        } finally {

          await trainingDatabase

            .deleteFrom(
              'training.session_blocks',
            )

            .where(
              'id',
              '=',
              temporaryBlockId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },

    );


    it(
      'updates session exercise planned notes for SELF access',
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
                `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}`,

              payload: {

                plannedNotes:
                  '  Técnica estricta  ',

              },

            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          expect(
            response.json(),
          ).toMatchObject({

            id:
              sessionExerciseId,

            athleteId,

            sessionId,

            blockId,

            plannedNotes:
              'Técnica estricta',

          });

          const persisted =
            await trainingDatabase

              .selectFrom(
                'training.session_exercises',
              )

              .select(
                'planned_notes',
              )

              .where(
                'id',
                '=',
                sessionExerciseId,
              )

              .executeTakeFirst();

          expect(
            persisted?.planned_notes,
          ).toBe(
            'Técnica estricta',
          );

        } finally {

          await trainingDatabase

            .updateTable(
              'training.session_exercises',
            )

            .set({

              planned_notes:
                null,

            })

            .where(
              'id',
              '=',
              sessionExerciseId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

    it(
      'allows COACH to update session exercise planned notes',
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
                `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}`,

              payload: {

                plannedNotes:
                  'Nota del entrenador',

              },

            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          expect(
            response.json(),
          ).toMatchObject({

            id:
              sessionExerciseId,

            plannedNotes:
              'Nota del entrenador',

          });

        } finally {

          await trainingDatabase

            .updateTable(
              'training.session_exercises',
            )

            .set({

              planned_notes:
                null,

            })

            .where(
              'id',
              '=',
              sessionExerciseId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

    it(
      'denies session exercise update to VIEWER access',
      async () => {

        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({

            method:
              'PATCH',

            url:
              `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}`,

            payload: {

              plannedNotes:
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
      'deletes a session exercise for SELF access and cascades performance entries',
      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const temporarySessionExerciseId =
          randomUUID();

        const temporaryPerformanceEntryId =
          randomUUID();

        await trainingDatabase

          .insertInto(
            'training.session_exercises',
          )

          .values({

            id:
              temporarySessionExerciseId,

            block_id:
              blockId,

            session_id:
              sessionId,

            athlete_id:
              athleteId,

            exercise_id:
              exerciseId,

            position:
              90,

            planned_notes:
              'Temporal',

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
              temporaryPerformanceEntryId,

            session_exercise_id:
              temporarySessionExerciseId,

            athlete_id:
              athleteId,

            position:
              0,

            planned_reps:
              5,

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

          .execute();

        try {

          const response =
            await app.inject({

              method:
                'DELETE',

              url:
                `/api/training/athletes/${athleteId}/session-exercises/${temporarySessionExerciseId}`,

            });

          expect(
            response.statusCode,
          ).toBe(
            204,
          );

          const persistedExercise =
            await trainingDatabase

              .selectFrom(
                'training.session_exercises',
              )

              .select(
                'id',
              )

              .where(
                'id',
                '=',
                temporarySessionExerciseId,
              )

              .executeTakeFirst();

          expect(
            persistedExercise,
          ).toBeUndefined();

          const persistedEntry =
            await trainingDatabase

              .selectFrom(
                'training.performance_entries',
              )

              .select(
                'id',
              )

              .where(
                'id',
                '=',
                temporaryPerformanceEntryId,
              )

              .executeTakeFirst();

          expect(
            persistedEntry,
          ).toBeUndefined();

        } finally {

          await trainingDatabase

            .deleteFrom(
              'training.performance_entries',
            )

            .where(
              'id',
              '=',
              temporaryPerformanceEntryId,
            )

            .execute();

          await trainingDatabase

            .deleteFrom(
              'training.session_exercises',
            )

            .where(
              'id',
              '=',
              temporarySessionExerciseId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

    it(
      'allows COACH to delete a session exercise',
      async () => {

        await setAthleteAccessRole(
          'COACH',
        );

        const temporarySessionExerciseId =
          randomUUID();

        await trainingDatabase

          .insertInto(
            'training.session_exercises',
          )

          .values({

            id:
              temporarySessionExerciseId,

            block_id:
              blockId,

            session_id:
              sessionId,

            athlete_id:
              athleteId,

            exercise_id:
              exerciseId,

            position:
              91,

            planned_notes:
              null,

            actual_notes:
              null,

          })

          .execute();

        try {

          const response =
            await app.inject({

              method:
                'DELETE',

              url:
                `/api/training/athletes/${athleteId}/session-exercises/${temporarySessionExerciseId}`,

            });

          expect(
            response.statusCode,
          ).toBe(
            204,
          );

        } finally {

          await trainingDatabase

            .deleteFrom(
              'training.session_exercises',
            )

            .where(
              'id',
              '=',
              temporarySessionExerciseId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

    it(
      'denies session exercise deletion to VIEWER access',
      async () => {

        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({

            method:
              'DELETE',

            url:
              `/api/training/athletes/${athleteId}/session-exercises/${sessionExerciseId}`,

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
      'moves and reorders session exercises across blocks for SELF access',
      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const targetBlockId =
          randomUUID();

        const secondExerciseId =
          randomUUID();

        await trainingDatabase

          .insertInto(
            'training.session_blocks',
          )

          .values({

            id:
              targetBlockId,

            session_id:
              sessionId,

            athlete_id:
              athleteId,

            position:
              90,

            title:
              'Bloque destino',

            notes:
              null,

          })

          .execute();

        await trainingDatabase

          .insertInto(
            'training.session_exercises',
          )

          .values({

            id:
              secondExerciseId,

            block_id:
              blockId,

            session_id:
              sessionId,

            athlete_id:
              athleteId,

            exercise_id:
              exerciseId,

            position:
              90,

            planned_notes:
              null,

            actual_notes:
              null,

          })

          .execute();

        try {

          const currentBlocks =
            await trainingDatabase

              .selectFrom(
                'training.session_blocks',
              )

              .select([
                'id',
                'position',
              ])

              .where(
                'session_id',
                '=',
                sessionId,
              )

              .orderBy(
                'position',
                'asc',
              )

              .execute();

          const currentExercises =
            await trainingDatabase

              .selectFrom(
                'training.session_exercises',
              )

              .select([
                'id',
                'block_id',
                'position',
              ])

              .where(
                'session_id',
                '=',
                sessionId,
              )

              .orderBy(
                'position',
                'asc',
              )

              .execute();

          const layout =
            currentBlocks.map(
              block => ({

                blockId:
                  block.id,

                orderedIds:
                  currentExercises

                    .filter(
                      exercise =>
                        exercise.block_id ===
                        block.id,
                    )

                    .map(
                      exercise =>
                        exercise.id,
                    ),

              }),
            );

          const sourceBlock =
            layout.find(
              block =>
                block.blockId ===
                blockId,
            );

          const targetBlock =
            layout.find(
              block =>
                block.blockId ===
                targetBlockId,
            );

          if (
            !sourceBlock ||
            !targetBlock
          ) {

            throw new Error(
              'Integration test layout setup failed',
            );

          }

          sourceBlock.orderedIds =
            sourceBlock.orderedIds.filter(
              id =>
                id !==
                secondExerciseId,
            );

          targetBlock.orderedIds = [
            secondExerciseId,
            ...targetBlock.orderedIds,
          ];

          const response =
            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/exercises/layout`,

              payload: {

                blocks:
                  layout,

              },

            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          const persisted =
            await trainingDatabase

              .selectFrom(
                'training.session_exercises',
              )

              .select([
                'block_id',
                'position',
              ])

              .where(
                'id',
                '=',
                secondExerciseId,
              )

              .executeTakeFirst();

          expect(
            persisted,
          ).toEqual({

            block_id:
              targetBlockId,

            position:
              0,

          });

        } finally {

          await trainingDatabase

            .deleteFrom(
              'training.session_exercises',
            )

            .where(
              'id',
              '=',
              secondExerciseId,
            )

            .execute();

          await trainingDatabase

            .deleteFrom(
              'training.session_blocks',
            )

            .where(
              'id',
              '=',
              targetBlockId,
            )

            .execute();

          /*
           * Restore baseline exercise position because the
           * layout operation normalizes every block.
           */
          await trainingDatabase

            .updateTable(
              'training.session_exercises',
            )

            .set({

              block_id:
                blockId,

              position:
                0,

            })

            .where(
              'id',
              '=',
              sessionExerciseId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

    it(
      'denies session exercise layout changes to VIEWER access',
      async () => {

        await setAthleteAccessRole(
          'VIEWER',
        );

        const currentBlocks =
          await trainingDatabase

            .selectFrom(
              'training.session_blocks',
            )

            .select(
              'id',
            )

            .where(
              'session_id',
              '=',
              sessionId,
            )

            .orderBy(
              'position',
              'asc',
            )

            .execute();

        const currentExercises =
          await trainingDatabase

            .selectFrom(
              'training.session_exercises',
            )

            .select([
              'id',
              'block_id',
              'position',
            ])

            .where(
              'session_id',
              '=',
              sessionId,
            )

            .orderBy(
              'position',
              'asc',
            )

            .execute();

        const response =
          await app.inject({

            method:
              'PUT',

            url:
              `/api/training/athletes/${athleteId}/sessions/${sessionId}/exercises/layout`,

            payload: {

              blocks:
                currentBlocks.map(
                  block => ({

                    blockId:
                      block.id,

                    orderedIds:
                      currentExercises

                        .filter(
                          exercise =>
                            exercise.block_id ===
                            block.id,
                        )

                        .map(
                          exercise =>
                            exercise.id,
                        ),

                  }),
                ),

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
      'rejects duplicate exercise ids in a session exercise layout',
      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        try {

          const currentBlocks =
            await trainingDatabase

              .selectFrom(
                'training.session_blocks',
              )

              .select(
                'id',
              )

              .where(
                'session_id',
                '=',
                sessionId,
              )

              .orderBy(
                'position',
                'asc',
              )

              .execute();

          const layout =
            currentBlocks.map(
              block => ({

                blockId:
                  block.id,

                orderedIds:
                  block.id ===
                  blockId
                    ? [
                        sessionExerciseId,
                        sessionExerciseId,
                      ]
                    : [],

              }),
            );

          const response =
            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/exercises/layout`,

              payload: {

                blocks:
                  layout,

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
              'invalid_session_exercise_layout',

          });

        } finally {

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

    it(
      'rejects an incomplete session exercise layout',
      async () => {

        await setAthleteAccessRole(
          'SELF',
        );

        const temporarySessionExerciseId =
          randomUUID();

        await trainingDatabase

          .insertInto(
            'training.session_exercises',
          )

          .values({

            id:
              temporarySessionExerciseId,

            block_id:
              blockId,

            session_id:
              sessionId,

            athlete_id:
              athleteId,

            exercise_id:
              exerciseId,

            position:
              90,

            planned_notes:
              null,

            actual_notes:
              null,

          })

          .execute();

        try {

          const currentBlocks =
            await trainingDatabase

              .selectFrom(
                'training.session_blocks',
              )

              .select(
                'id',
              )

              .where(
                'session_id',
                '=',
                sessionId,
              )

              .orderBy(
                'position',
                'asc',
              )

              .execute();

          const response =
            await app.inject({

              method:
                'PUT',

              url:
                `/api/training/athletes/${athleteId}/sessions/${sessionId}/exercises/layout`,

              payload: {

                blocks:
                  currentBlocks.map(
                    block => ({

                      blockId:
                        block.id,

                      orderedIds:
                        block.id ===
                        blockId
                          ? [
                              sessionExerciseId,
                            ]
                          : [],

                    }),
                  ),

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
              'invalid_session_exercise_layout',

          });

        } finally {

          await trainingDatabase

            .deleteFrom(
              'training.session_exercises',
            )

            .where(
              'id',
              '=',
              temporarySessionExerciseId,
            )

            .execute();

          await setAthleteAccessRole(
            'VIEWER',
          );

        }

      },
    );

        it(
      'allows owner to list Training athlete access administration',
      async () => {

        authenticatedUserId =
          ownerUserId;

        const targetUserId =
          randomUUID();

        await controlDatabase
          .insertInto(
            'identity.users',
          )
          .values({
            id:
              targetUserId,

            name:
              'Training Admin Target',

            role:
              'member',

            created_at:
              new Date(),
          })
          .execute();

        try {

          const response =
            await app.inject({
              method:
                'GET',

              url:
                `/api/training/admin/users/${targetUserId}/athlete-access`,
            });

          expect(
            response.statusCode,
          ).toBe(
            200,
          );

          const body =
            response.json() as Array<{
              athleteId:
                string;

              displayName:
                string;

              role:
                string | null;
            }>;

          expect(
            body.some(
              entry =>
                entry.athleteId ===
                  athleteId &&
                entry.role ===
                  null,
            ),
          ).toBe(
            true,
          );

        } finally {

          await controlDatabase
            .deleteFrom(
              'identity.users',
            )
            .where(
              'id',
              '=',
              targetUserId,
            )
            .execute();

        }
      },
    );

    it(
      'allows owner to set and revoke Training athlete access',
      async () => {

        authenticatedUserId =
          ownerUserId;

        const targetUserId =
          randomUUID();

        await controlDatabase
          .insertInto(
            'identity.users',
          )
          .values({
            id:
              targetUserId,

            name:
              'Training Access Target',

            role:
              'member',

            created_at:
              new Date(),
          })
          .execute();

        try {

          const grantResponse =
            await app.inject({
              method:
                'PUT',

              url:
                `/api/training/admin/users/${targetUserId}/athletes/${athleteId}/access`,

              payload: {
                role:
                  'COACH',
              },
            });

          expect(
            grantResponse.statusCode,
          ).toBe(
            200,
          );

          expect(
            grantResponse.json(),
          ).toEqual({
            athleteId,

            userId:
              targetUserId,

            role:
              'COACH',
          });

          const persisted =
            await trainingDatabase
              .selectFrom(
                'training.athlete_access',
              )
              .select(
                'role',
              )
              .where(
                'athlete_id',
                '=',
                athleteId,
              )
              .where(
                'user_id',
                '=',
                targetUserId,
              )
              .executeTakeFirst();

          expect(
            persisted?.role,
          ).toBe(
            'COACH',
          );

          const updateResponse =
            await app.inject({
              method:
                'PUT',

              url:
                `/api/training/admin/users/${targetUserId}/athletes/${athleteId}/access`,

              payload: {
                role:
                  'VIEWER',
              },
            });

          expect(
            updateResponse.statusCode,
          ).toBe(
            200,
          );

          expect(
            updateResponse.json(),
          ).toEqual({
            athleteId,

            userId:
              targetUserId,

            role:
              'VIEWER',
          });

          const revokeResponse =
            await app.inject({
              method:
                'PUT',

              url:
                `/api/training/admin/users/${targetUserId}/athletes/${athleteId}/access`,

              payload: {
                role:
                  null,
              },
            });

          expect(
            revokeResponse.statusCode,
          ).toBe(
            200,
          );

          expect(
            revokeResponse.json(),
          ).toEqual({
            athleteId,

            userId:
              targetUserId,

            role:
              null,
          });

          const removed =
            await trainingDatabase
              .selectFrom(
                'training.athlete_access',
              )
              .select(
                'id',
              )
              .where(
                'athlete_id',
                '=',
                athleteId,
              )
              .where(
                'user_id',
                '=',
                targetUserId,
              )
              .executeTakeFirst();

          expect(
            removed,
          ).toBeUndefined();

        } finally {

          await trainingDatabase
            .deleteFrom(
              'training.athlete_access',
            )
            .where(
              'user_id',
              '=',
              targetUserId,
            )
            .execute();

          await controlDatabase
            .deleteFrom(
              'identity.users',
            )
            .where(
              'id',
              '=',
              targetUserId,
            )
            .execute();

        }
      },
    );

    it(
      'denies Training access administration to non-owner users',
      async () => {

        const memberUserId =
          randomUUID();

        await controlDatabase
          .insertInto(
            'identity.users',
          )
          .values({
            id:
              memberUserId,

            name:
              'Training Admin Member',

            role:
              'member',

            created_at:
              new Date(),
          })
          .execute();

        authenticatedUserId =
          memberUserId;

        try {

          const response =
            await app.inject({
              method:
                'GET',

              url:
                `/api/training/admin/users/${ownerUserId}/athlete-access`,
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
              'owner_required',
          });

        } finally {

          authenticatedUserId =
            ownerUserId;

          await controlDatabase
            .deleteFrom(
              'identity.users',
            )
            .where(
              'id',
              '=',
              memberUserId,
            )
            .execute();

        }
      },
    );

    it(
      'rejects invalid Training athlete access administration payload',
      async () => {

        authenticatedUserId =
          ownerUserId;

        const response =
          await app.inject({
            method:
              'PUT',

            url:
              `/api/training/admin/users/${ownerUserId}/athletes/${athleteId}/access`,

            payload: {
              role:
                'ADMIN',
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
      },
    );

    it(
      'returns 404 when administering an unknown Training athlete',
      async () => {

        authenticatedUserId =
          ownerUserId;

        const response =
          await app.inject({
            method:
              'PUT',

            url:
              `/api/training/admin/users/${ownerUserId}/athletes/${randomUUID()}/access`,

            payload: {
              role:
                'VIEWER',
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
            'training_athlete_not_found',
        });
      },
    );

    it(
      'returns null when no daily check-in exists',
      async () => {

        authenticatedUserId =
          ownerUserId;

        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/training/athletes/${athleteId}/daily-checkins/2026-09-20`,
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        expect(
          response.json(),
        ).toBeNull();
      },
    );

    it(
      'allows SELF to create a daily check-in',
      async () => {

        authenticatedUserId =
          ownerUserId;

        await setAthleteAccessRole(
          'SELF',
        );

        const response =
          await app.inject({
            method:
              'PUT',

            url:
              `/api/training/athletes/${athleteId}/daily-checkins/2026-09-21`,

            payload: {
              weightKg:
                83.2,

              sleepQuality:
                4,

              fatigue:
                2,

              soreness:
                3,

              stress:
                1,

              motivation:
                5,

              notes:
                'Buen día.',
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
          body.athleteId,
        ).toBe(
          athleteId,
        );

        expect(
          body.date,
        ).toBe(
          '2026-09-21',
        );

        expect(
          body.weightKg,
        ).toBe(
          83.2,
        );

        expect(
          body.sleepQuality,
        ).toBe(
          4,
        );

        expect(
          body.recordedByUserId,
        ).toBe(
          ownerUserId,
        );
      },
    );

    it(
      'allows VIEWER to read an existing daily check-in',
      async () => {

        authenticatedUserId =
          ownerUserId;

        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/training/athletes/${athleteId}/daily-checkins/2026-09-21`,
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        const body =
          response.json();

        expect(
          body.date,
        ).toBe(
          '2026-09-21',
        );

        expect(
          body.weightKg,
        ).toBe(
          83.2,
        );

        expect(
          body.notes,
        ).toBe(
          'Buen día.',
        );
      },
    );

    it(
      'allows COACH to update the same daily check-in without creating a duplicate',
      async () => {

        authenticatedUserId =
          ownerUserId;

        await setAthleteAccessRole(
          'COACH',
        );

        const response =
          await app.inject({
            method:
              'PUT',

            url:
              `/api/training/athletes/${athleteId}/daily-checkins/2026-09-21`,

            payload: {
              weightKg:
                82.9,

              sleepQuality:
                5,

              fatigue:
                1,

              soreness:
                2,

              stress:
                2,

              motivation:
                5,

              notes:
                'Actualizado.',
            },
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        const rows =
          await trainingDatabase
            .selectFrom(
              'training.daily_checkins',
            )
            .selectAll()
            .where(
              'athlete_id',
              '=',
              athleteId,
            )
            .where(
              'date',
              '=',
              '2026-09-21',
            )
            .execute();

        expect(
          rows,
        ).toHaveLength(
          1,
        );

        expect(
          rows[0]?.weight_kg,
        ).toBe(
          '82.90',
        );

        expect(
          rows[0]?.notes,
        ).toBe(
          'Actualizado.',
        );
      },
    );

    it(
      'denies VIEWER write access to daily check-ins',
      async () => {

        authenticatedUserId =
          ownerUserId;

        await setAthleteAccessRole(
          'VIEWER',
        );

        const response =
          await app.inject({
            method:
              'PUT',

            url:
              `/api/training/athletes/${athleteId}/daily-checkins/2026-09-22`,

            payload: {
              weightKg:
                83,

              sleepQuality:
                4,

              fatigue:
                2,

              soreness:
                2,

              stress:
                1,

              motivation:
                4,

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
      'rejects invalid daily check-in payloads',
      async () => {

        authenticatedUserId =
          ownerUserId;

        await setAthleteAccessRole(
          'SELF',
        );

        const response =
          await app.inject({
            method:
              'PUT',

            url:
              `/api/training/athletes/${athleteId}/daily-checkins/2026-09-23`,

            payload: {
              weightKg:
                83,

              sleepQuality:
                9,

              fatigue:
                2,

              soreness:
                2,

              stress:
                1,

              motivation:
                4,

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
            'invalid_request',
        });
      },
    );

    it(
      'denies daily check-in access without explicit athlete access',
      async () => {

        authenticatedUserId =
          ownerUserId;

        await trainingDatabase
          .deleteFrom(
            'training.athlete_access',
          )
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

        try {

          const response =
            await app.inject({
              method:
                'GET',

              url:
                `/api/training/athletes/${athleteId}/daily-checkins/2026-09-21`,
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

        } finally {

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

        }
      },
    );

  },
);
