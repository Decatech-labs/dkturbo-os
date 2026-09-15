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
  },
);
