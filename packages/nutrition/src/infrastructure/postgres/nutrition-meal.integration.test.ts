import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  sql,
} from 'kysely';

import {
  addFoodToMeal,
  createFood,
  createMeal,
  createWeeklyPlan,
  getMealDetail,
  getWeeklyPlanDetail,
} from '../../application/index.js';

import type {
  DkturboUserId,
  NutritionDayId,
  NutritionMealId,
  NutritionMealItemId,
  NutritionPlanId,
} from '../../domain/index.js';

import {
  createNutritionDatabase,
} from './create-nutrition-database.js';

import {
  PostgresNutritionUnitOfWork,
} from './postgres-nutrition-unit-of-work.js';

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required for Nutrition integration tests',
  );
}

/*
 * Dedicated fixture namespace for Nutrition meal tests.
 */
const creatorUserId =
  'b1100000-0000-4000-8000-000000000001' as
    DkturboUserId;

const secondUserId =
  'b1100000-0000-4000-8000-000000000002' as
    DkturboUserId;

const planTitle =
  'Nutrition Meal Integration';

describe(
  'Nutrition meal PostgreSQL integration',
  () => {

    const db =
      createNutritionDatabase({
        connectionString:
          databaseUrl,
      });

    const unitOfWork =
      new PostgresNutritionUnitOfWork(
        db,
      );

    const cleanup =
      async (): Promise<void> => {

        /*
         * Deleting plans cascades through:
         *
         * days
         * → meals
         * → meal_items
         * → meal_item_quantities
         *
         * Foods do not belong to plan lifetime,
         * so they are cleaned explicitly.
         */
        await db
          .deleteFrom(
            'nutrition.plans',
          )
          .where(
            'created_by_user_id',
            '=',
            creatorUserId,
          )
          .execute();

        await db
          .deleteFrom(
            'nutrition.foods',
          )
          .where(
            'created_by_user_id',
            '=',
            creatorUserId,
          )
          .execute();

        await sql`
          delete from identity.users
          where id in (
            ${creatorUserId},
            ${secondUserId}
          )
        `.execute(
          db,
        );
      };

    beforeAll(
      async () => {

        await cleanup();

        await sql`
          insert into identity.users (
            id,
            name,
            role,
            created_at
          )
          values
          (
            ${creatorUserId},
            'Nutrition Meal Creator',
            'member',
            current_timestamp
          ),
          (
            ${secondUserId},
            'Nutrition Meal Second User',
            'member',
            current_timestamp
          )
        `.execute(
          db,
        );
      },
    );

    afterAll(
      async () => {

        await cleanup();

        await db.destroy();
      },
    );

    it(
      'persists a complete meal and calculates nutrients for each user',
      async () => {

        const weeklyPlan =
          await createWeeklyPlan(
            unitOfWork,
            {
              title:
                planTitle,

              weekStart:
                '2026-09-21',

              createdByUserId:
                creatorUserId,
            },
          );

        const monday =
          weeklyPlan.days[0];

        expect(
          monday,
        ).toBeDefined();

        if (!monday) {
          throw new Error(
            'Monday was not created',
          );
        }

        const meal =
          await createMeal(
            unitOfWork,
            {
              dayId:
                monday.id as
                  NutritionDayId,

              name:
                'Comida',

              plannedTime:
                '14:00',

              position:
                0,

              notes:
                'Postentreno',
            },
          );

        const rice =
          await createFood(
            unitOfWork,
            {
              name:
                'Arroz basmati',

              brand:
                null,

              referenceAmount:
                100,

              referenceUnit:
                'G',

              caloriesKcal:
                356,

              proteinG:
                7.5,

              carbohydratesG:
                78,

              fatG:
                0.9,

              fiberG:
                1.2,

              createdByUserId:
                creatorUserId,
            },
          );

        const chicken =
          await createFood(
            unitOfWork,
            {
              name:
                'Pechuga de pollo',

              brand:
                null,

              referenceAmount:
                100,

              referenceUnit:
                'G',

              caloriesKcal:
                120,

              proteinG:
                23,

              carbohydratesG:
                0,

              fatG:
                2,

              fiberG:
                null,

              createdByUserId:
                creatorUserId,
            },
          );

        await addFoodToMeal(
          unitOfWork,
          {
            mealId:
              meal.id,

            foodId:
              rice.id,

            position:
              0,

            notes:
              null,

            quantities: [
              {
                userId:
                  creatorUserId,

                quantity:
                  140,
              },
              {
                userId:
                  secondUserId,

                quantity:
                  100,
              },
            ],
          },
        );

        await addFoodToMeal(
          unitOfWork,
          {
            mealId:
              meal.id,

            foodId:
              chicken.id,

            position:
              1,

            notes:
              null,

            quantities: [
              {
                userId:
                  creatorUserId,

                quantity:
                  220,
              },
              {
                userId:
                  secondUserId,

                quantity:
                  180,
              },
            ],
          },
        );

        const detail =
          await getMealDetail(
            unitOfWork,
            meal.id as NutritionMealId,
          );

        expect(
          detail.meal,
        ).toMatchObject({
          id:
            meal.id,

          name:
            'Comida',

          plannedTime:
            '14:00',

          notes:
            'Postentreno',
        });

        expect(
          detail.items,
        ).toHaveLength(
          2,
        );

        expect(
          detail.items.map(
            item =>
              item.food.name,
          ),
        ).toEqual([
          'Arroz basmati',
          'Pechuga de pollo',
        ]);

        const creator =
          detail.totalsByUser.find(
            total =>
              total.userId ===
              creatorUserId,
          );

        const second =
          detail.totalsByUser.find(
            total =>
              total.userId ===
              secondUserId,
          );

        expect(
          creator?.nutrients,
        ).toEqual({
          caloriesKcal:
            762.4,

          proteinG:
            61.1,

          carbohydratesG:
            109.2,

          fatG:
            5.66,

          fiberG:
            1.68,
        });

        expect(
          second?.nutrients,
        ).toEqual({
          caloriesKcal:
            572,

          proteinG:
            48.9,

          carbohydratesG:
            78,

          fatG:
            4.5,

          fiberG:
            1.2,
        });

        /*
         * Also verify raw persistence.
         */
        const persistedMeals =
          await db
            .selectFrom(
              'nutrition.meals',
            )
            .selectAll()
            .where(
              'day_id',
              '=',
              monday.id,
            )
            .execute();

        expect(
          persistedMeals,
        ).toHaveLength(
          1,
        );

        const persistedItems =
          await db
            .selectFrom(
              'nutrition.meal_items',
            )
            .selectAll()
            .where(
              'meal_id',
              '=',
              meal.id,
            )
            .orderBy(
              'position',
              'asc',
            )
            .execute();

        expect(
          persistedItems,
        ).toHaveLength(
          2,
        );

        const persistedQuantities =
          await db
            .selectFrom(
              'nutrition.meal_item_quantities',
            )
            .selectAll()
            .where(
              'meal_item_id',
              'in',
              persistedItems.map(
                item =>
                  item.id,
              ),
            )
            .execute();

        expect(
          persistedQuantities,
        ).toHaveLength(
          4,
        );
      },
    );

    it(
      'upserts one user quantity without creating a duplicate',
      async () => {

        const plan =
          await db
            .selectFrom(
              'nutrition.plans',
            )
            .select([
              'id',
            ])
            .where(
              'title',
              '=',
              planTitle,
            )
            .executeTakeFirstOrThrow();

        const day =
          await db
            .selectFrom(
              'nutrition.days',
            )
            .select([
              'id',
            ])
            .where(
              'plan_id',
              '=',
              plan.id as NutritionPlanId,
            )
            .where(
              'date',
              '=',
              '2026-09-21',
            )
            .executeTakeFirstOrThrow();

        const meal =
          await db
            .selectFrom(
              'nutrition.meals',
            )
            .select([
              'id',
            ])
            .where(
              'day_id',
              '=',
              day.id,
            )
            .executeTakeFirstOrThrow();

        const rice =
          await db
            .selectFrom(
              'nutrition.foods',
            )
            .select([
              'id',
            ])
            .where(
              'name',
              '=',
              'Arroz basmati',
            )
            .executeTakeFirstOrThrow();

        const riceItem =
          await db
            .selectFrom(
              'nutrition.meal_items',
            )
            .select([
              'id',
            ])
            .where(
              'meal_id',
              '=',
              meal.id,
            )
            .where(
              'food_id',
              '=',
              rice.id,
            )
            .executeTakeFirstOrThrow();

        await unitOfWork.execute(
          async ({
            mealItems,
          }) => {

            await mealItems.saveQuantities([
              {
                mealItemId:
                  riceItem.id as
                    NutritionMealItemId,

                userId:
                  creatorUserId,

                quantity:
                  160,
              },
            ]);
          },
        );

        const rows =
          await db
            .selectFrom(
              'nutrition.meal_item_quantities',
            )
            .selectAll()
            .where(
              'meal_item_id',
              '=',
              riceItem.id,
            )
            .where(
              'user_id',
              '=',
              creatorUserId,
            )
            .execute();

        expect(
          rows,
        ).toHaveLength(
          1,
        );

        expect(
          Number(
            rows[0]?.quantity,
          ),
        ).toBe(
          160,
        );

        const detail =
          await getMealDetail(
            unitOfWork,
            meal.id as NutritionMealId,
          );

        const creator =
          detail.totalsByUser.find(
            total =>
              total.userId ===
              creatorUserId,
          );

        expect(
          creator?.nutrients,
        ).toEqual({
          caloriesKcal:
            833.6,

          proteinG:
            62.6,

          carbohydratesG:
            124.8,

          fatG:
            5.84,

          fiberG:
            1.92,
        });
      },
    );

    it(
      'returns the complete weekly read model from PostgreSQL',
      async () => {

        const plan =
          await db
            .selectFrom(
              'nutrition.plans',
            )
            .select([
              'id',
            ])
            .where(
              'title',
              '=',
              planTitle,
            )
            .executeTakeFirstOrThrow();

        const detail =
          await getWeeklyPlanDetail(
            unitOfWork,
            plan.id as NutritionPlanId,
          );

        expect(
          detail.days,
        ).toHaveLength(
          7,
        );

        expect(
          detail.days.map(
            day =>
              day.day.date,
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

        const monday =
          detail.days[0];

        expect(
          monday,
        ).toBeDefined();

        if (!monday) {
          throw new Error(
            'Monday detail missing',
          );
        }

        expect(
          monday.meals,
        ).toHaveLength(
          1,
        );

        expect(
          monday.meals[0]?.items.map(
            item =>
              item.food.name,
          ),
        ).toEqual([
          'Arroz basmati',
          'Pechuga de pollo',
        ]);

        const creatorDaily =
          monday.dailyTotalsByUser.find(
            total =>
              total.userId ===
              creatorUserId,
          );

        /*
        * Previous integration test updated rice
        * from 140 g to 160 g.
        */
        expect(
          creatorDaily?.nutrients,
        ).toEqual({
          caloriesKcal:
            833.6,

          proteinG:
            62.6,

          carbohydratesG:
            124.8,

          fatG:
            5.84,

          fiberG:
            1.92,
        });

        const secondDaily =
          monday.dailyTotalsByUser.find(
            total =>
              total.userId ===
              secondUserId,
          );

        expect(
          secondDaily?.nutrients,
        ).toEqual({
          caloriesKcal:
            572,

          proteinG:
            48.9,

          carbohydratesG:
            78,

          fatG:
            4.5,

          fiberG:
            1.2,
        });

        expect(
          detail.weeklyTotalsByUser.find(
            total =>
              total.userId ===
              creatorUserId,
          )?.nutrients,
        ).toEqual(
          creatorDaily?.nutrients,
        );
      },
    );
  },
);
