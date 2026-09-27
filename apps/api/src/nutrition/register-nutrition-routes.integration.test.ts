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
  createNutrition,
  createNutritionDatabase,
} from '@dkturbo/nutrition';

import {
  registerNutritionRoutes,
} from './register-nutrition-routes.js';

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required for API integration tests',
  );
}

const ownerUserId =
  'e1000000-0000-4000-8000-000000000001';

const secondUserId =
  'e1000000-0000-4000-8000-000000000002';

describe(
  'Nutrition HTTP routes PostgreSQL integration',
  () => {

    const controlDatabase =
      createDatabase({
        connectionString:
          databaseUrl,
      });

    const nutritionDatabase =
      createNutritionDatabase({
        connectionString:
          databaseUrl,
      });

    const controlPlane =
      createControlPlane({
        database:
          controlDatabase,
      });

    const nutrition =
      createNutrition({
        database:
          nutritionDatabase,
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
            registerNutritionRoutes({
              http,
              nutrition,

              listPeople:
                async () => {

                  const users =
                    await controlPlane
                      .identity
                      .listUsers
                      .execute();

                  return users.map(
                    (user) => ({
                      id:
                        user.id,

                      name:
                        user.name,
                    }),
                  );
                },
            });
          },
      });

    const cleanup =
      async (): Promise<void> => {

        await nutritionDatabase
          .deleteFrom(
            'nutrition.plans',
          )
          .where(
            'created_by_user_id',
            '=',
            ownerUserId,
          )
          .execute();

        await nutritionDatabase
          .deleteFrom(
            'nutrition.foods',
          )
          .where(
            'created_by_user_id',
            '=',
            ownerUserId,
          )
          .execute();

        await nutritionDatabase
          .deleteFrom(
            'nutrition.person_access',
          )
          .where(
            'grantee_user_id',
            '=',
            ownerUserId,
          )
          .execute();

        await controlDatabase
          .deleteFrom(
            'identity.users',
          )
          .where(
            'id',
            'in',
            [
              ownerUserId,
              secondUserId,
            ],
          )
          .execute();
      };

    beforeAll(
      async () => {

        await cleanup();

        await controlDatabase
          .insertInto(
            'identity.users',
          )
          .values([
            {
              id:
                ownerUserId,

              name:
                'Nutrition API Owner',

              role:
                'owner',

              created_at:
                new Date(),
            },
            {
              id:
                secondUserId,

              name:
                'Nutrition API Second User',

              role:
                'member',

              created_at:
                new Date(),
            },
          ])
          .execute();

        await nutritionDatabase
          .insertInto(
            'nutrition.person_access',
          )
          .values({
            grantee_user_id:
              ownerUserId,

            subject_user_id:
              secondUserId,

            role:
              'MANAGER',

            created_at:
              new Date(),

            updated_at:
              new Date(),
          })
          .execute();
      },
    );

    afterAll(
      async () => {

        await cleanup();

        await app.close();

        await nutritionDatabase
          .destroy();

        await controlDatabase
          .destroy();
      },
    );

    it(
      'creates a weekly Nutrition plan',
      async () => {

        authenticatedUserId =
          ownerUserId;

        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/api/nutrition/plans',

            payload: {
              title:
                'Semana API Nutrition',

              weekStart:
                '2026-09-21',
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
          body.plan,
        ).toMatchObject({
          title:
            'Semana API Nutrition',

          startDate:
            '2026-09-21',

          endDate:
            '2026-09-27',

          status:
            'DRAFT',

          createdByUserId:
            ownerUserId,
        });

        expect(
          body.days,
        ).toHaveLength(
          7,
        );

        expect(
          body.days.map(
            (
              day: {
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
      },
    );

    it(
      'lists Nutrition plans',
      async () => {

        authenticatedUserId =
          ownerUserId;

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/nutrition/plans',
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        const body =
          response.json();

        expect(
          Array.isArray(
            body,
          ),
        ).toBe(
          true,
        );

        expect(
          body,
        ).toHaveLength(
          1,
        );

        expect(
          body[0],
        ).toMatchObject({
          title:
            'Semana API Nutrition',

          startDate:
            '2026-09-21',

          endDate:
            '2026-09-27',
        });
      },
    );

    it(
      'returns the complete weekly Nutrition detail',
      async () => {

        const plan =
          await nutritionDatabase
            .selectFrom(
              'nutrition.plans',
            )
            .select([
              'id',
            ])
            .where(
              'title',
              '=',
              'Semana API Nutrition',
            )
            .executeTakeFirstOrThrow();

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/nutrition/plans/${plan.id}`,
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        const body =
          response.json();

        expect(
          body.plan,
        ).toMatchObject({
          id:
            plan.id,

          title:
            'Semana API Nutrition',
        });

        expect(
          body.days,
        ).toHaveLength(
          7,
        );

        expect(
          body.targets,
        ).toEqual(
          [],
        );

        expect(
          body.weeklyTotalsByUser,
        ).toEqual(
          [],
        );
      },
    );

    it(
      'sets daily Nutrition targets for a family user',
      async () => {

        const plan =
          await nutritionDatabase
            .selectFrom(
              'nutrition.plans',
            )
            .select([
              'id',
            ])
            .where(
              'title',
              '=',
              'Semana API Nutrition',
            )
            .executeTakeFirstOrThrow();

        const response =
          await app.inject({
            method:
              'PUT',

            url:
              `/api/nutrition/plans/${plan.id}/targets/${secondUserId}`,

            payload: {
              caloriesKcal:
                2800,

              proteinG:
                160,

              carbohydratesG:
                360,

              fatG:
                80,

              fiberG:
                30,
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
          planId:
            plan.id,

          userId:
            secondUserId,

          caloriesKcal:
            2800,

          proteinG:
            160,

          carbohydratesG:
            360,

          fatG:
            80,

          fiberG:
            30,
        });
      },
    );

    it(
      'exposes targets in the weekly read model',
      async () => {

        const plan =
          await nutritionDatabase
            .selectFrom(
              'nutrition.plans',
            )
            .select([
              'id',
            ])
            .where(
              'title',
              '=',
              'Semana API Nutrition',
            )
            .executeTakeFirstOrThrow();

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/nutrition/plans/${plan.id}`,
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        const body =
          response.json();

        expect(
          body.targets,
        ).toHaveLength(
          1,
        );

        expect(
          body.targets[0],
        ).toMatchObject({
          userId:
            secondUserId,

          caloriesKcal:
            2800,

          proteinG:
            160,

          carbohydratesG:
            360,

          fatG:
            80,

          fiberG:
            30,
        });

        /*
         * Even an empty day must expose progress
         * for users that have a target.
         */
        expect(
          body.days[0]
            .progressByUser,
        ).toEqual([
          expect.objectContaining({
            userId:
              secondUserId,

            planned: {
              caloriesKcal:
                0,

              proteinG:
                0,

              carbohydratesG:
                0,

              fatG:
                0,

              fiberG:
                0,
            },

            remaining: {
              caloriesKcal:
                2800,

              proteinG:
                160,

              carbohydratesG:
                360,

              fatG:
                80,

              fiberG:
                30,
            },
          }),
        ]);
      },
    );

    it(
      'rejects an invalid plan id',
      async () => {

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/nutrition/plans/not-a-uuid',
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
      'rejects negative Nutrition targets',
      async () => {

        const plan =
          await nutritionDatabase
            .selectFrom(
              'nutrition.plans',
            )
            .select([
              'id',
            ])
            .where(
              'title',
              '=',
              'Semana API Nutrition',
            )
            .executeTakeFirstOrThrow();

        const response =
          await app.inject({
            method:
              'PUT',

            url:
              `/api/nutrition/plans/${plan.id}/targets/${secondUserId}`,

            payload: {
              caloriesKcal:
                -1,

              proteinG:
                160,

              carbohydratesG:
                360,

              fatG:
                80,

              fiberG:
                30,
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
            'invalid_nutrition_target',
        });
      },
    );

    it(
      'returns 404 for a missing Nutrition plan',
      async () => {

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/nutrition/plans/e9000000-0000-4000-8000-000000000099',
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
            'nutrition_plan_not_found',
        });
      },
    );

    it(
      'lists people available to Nutrition',
      async () => {

        authenticatedUserId =
          ownerUserId;

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/api/nutrition/people',
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        expect(
          response.json(),
        ).toEqual(
          expect.arrayContaining([
            {
              id:
                ownerUserId,

              name:
                'Nutrition API Owner',

              accessRole:
                'SELF',
            },
            {
              id:
                secondUserId,

              name:
                'Nutrition API Second User',

              accessRole:
                'MANAGER',
            },
          ]),
        );
      },
    );

    it(
      'creates a meal inside a Nutrition day',
      async () => {

        const plan =
          await nutritionDatabase
            .selectFrom(
              'nutrition.plans',
            )
            .select([
              'id',
            ])
            .where(
              'title',
              '=',
              'Semana API Nutrition',
            )
            .executeTakeFirstOrThrow();

        const detailResponse =
          await app.inject({
            method:
              'GET',

            url:
              `/api/nutrition/plans/${plan.id}`,
          });

        const detail =
          detailResponse.json();

        const dayId =
          detail.days[0]
            .day.id as
              string;

        const response =
          await app.inject({
            method:
              'POST',

            url:
              `/api/nutrition/days/${dayId}/meals`,

            payload: {
              name:
                'Comida API',

              plannedTime:
                '14:00',

              position:
                0,

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
          dayId,

          name:
            'Comida API',

          plannedTime:
            '14:00',

          position:
            0,

          notes:
            null,
        });
      },
    );

        it(
      'creates and searches active Nutrition foods',
      async () => {

        const createResponse =
          await app.inject({
            method:
              'POST',

            url:
              '/api/nutrition/foods',

            payload: {
              name:
                'Arroz API Test',

              brand:
                null,

              referenceAmount:
                100,

              referenceUnit:
                'G',

              caloriesKcal:
                100,

              proteinG:
                10,

              carbohydratesG:
                20,

              fatG:
                5,

              fiberG:
                2,
            },
          });

        expect(
          createResponse.statusCode,
        ).toBe(
          201,
        );

        expect(
          createResponse.json(),
        ).toMatchObject({
          name:
            'Arroz API Test',

          referenceAmount:
            100,

          referenceUnit:
            'G',

          caloriesKcal:
            100,

          proteinG:
            10,

          carbohydratesG:
            20,

          fatG:
            5,

          fiberG:
            2,

          createdByUserId:
            ownerUserId,
        });

        const searchResponse =
          await app.inject({
            method:
              'GET',

            url:
              '/api/nutrition/foods?query=Arroz%20API',
          });

        expect(
          searchResponse.statusCode,
        ).toBe(
          200,
        );

        expect(
          searchResponse.json(),
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name:
                'Arroz API Test',
            }),
          ]),
        );
      },
    );

        it(
      'adds a food to a meal with per-user quantities',
      async () => {

        const plan =
          await nutritionDatabase
            .selectFrom(
              'nutrition.plans',
            )
            .select([
              'id',
            ])
            .where(
              'title',
              '=',
              'Semana API Nutrition',
            )
            .executeTakeFirstOrThrow();

        const detailResponse =
          await app.inject({
            method:
              'GET',

            url:
              `/api/nutrition/plans/${plan.id}`,
          });

        const detail =
          detailResponse.json();

        const meal =
          detail.days[0]
            .meals.find(
              (
                candidate: {
                  meal: {
                    name:
                      string;
                  };
                },
              ) =>
                candidate.meal.name ===
                'Comida API',
            );

        expect(
          meal,
        ).toBeTruthy();

        const foodsResponse =
          await app.inject({
            method:
              'GET',

            url:
              '/api/nutrition/foods?query=Arroz%20API%20Test',
          });

        const foods =
          foodsResponse.json();

        expect(
          foods,
        ).toHaveLength(
          1,
        );

        const response =
          await app.inject({
            method:
              'POST',

            url:
              `/api/nutrition/meals/${meal.meal.id}/items`,

            payload: {
              foodId:
                foods[0].id,

              position:
                0,

              notes:
                null,

              quantities: [
                {
                  userId:
                    ownerUserId,

                  quantity:
                    150,
                },
                {
                  userId:
                    secondUserId,

                  quantity:
                    50,
                },
              ],
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
          body.food,
        ).toMatchObject({
          name:
            'Arroz API Test',
        });

        expect(
          body.quantities,
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              userId:
                ownerUserId,

              quantity:
                150,
            }),

            expect.objectContaining({
              userId:
                secondUserId,

              quantity:
                50,
            }),
          ]),
        );
      },
    );

        it(
      'recalculates daily Nutrition totals after adding food',
      async () => {

        const plan =
          await nutritionDatabase
            .selectFrom(
              'nutrition.plans',
            )
            .select([
              'id',
            ])
            .where(
              'title',
              '=',
              'Semana API Nutrition',
            )
            .executeTakeFirstOrThrow();

        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/api/nutrition/plans/${plan.id}`,
          });

        expect(
          response.statusCode,
        ).toBe(
          200,
        );

        const detail =
          response.json();

        const firstDay =
          detail.days[0];

        const ownerTotals =
          firstDay
            .dailyTotalsByUser
            .find(
              (
                total: {
                  userId:
                    string;
                },
              ) =>
                total.userId ===
                ownerUserId,
            );

        const secondUserTotals =
          firstDay
            .dailyTotalsByUser
            .find(
              (
                total: {
                  userId:
                    string;
                },
              ) =>
                total.userId ===
                secondUserId,
            );

        expect(
          ownerTotals
            .nutrients,
        ).toEqual({
          caloriesKcal:
            150,

          proteinG:
            15,

          carbohydratesG:
            30,

          fatG:
            7.5,

          fiberG:
            3,
        });

        expect(
          secondUserTotals
            .nutrients,
        ).toEqual({
          caloriesKcal:
            50,

          proteinG:
            5,

          carbohydratesG:
            10,

          fatG:
            2.5,

          fiberG:
            1,
        });
      },
    );
  },
);
