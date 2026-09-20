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
  createWeeklyPlan,
  setPlanTarget,
} from '../../application/index.js';

import type {
  DkturboUserId,
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
 * Dedicated Nutrition fixture namespace.
 *
 * These IDs deliberately avoid the namespaces currently used
 * by Training integration tests so Vitest can run files
 * concurrently without sharing identity fixtures.
 */
const creatorUserId =
  'a1100000-0000-4000-8000-000000000001' as
    DkturboUserId;

const targetUserId =
  'a1100000-0000-4000-8000-000000000002' as
    DkturboUserId;

const weeklyTitle =
  'Nutrition Foundation Integration';

const atomicityTitle =
  'Nutrition Atomicity Integration';

describe(
  'Nutrition foundation PostgreSQL integration',
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
         * Plan deletion cascades through:
         *
         * plans
         *   -> plan_targets
         *   -> days
         *       -> meals
         *           -> meal_items
         *               -> meal_item_quantities
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

        await sql`
          delete from identity.users
          where id in (
            ${creatorUserId},
            ${targetUserId}
          )
        `.execute(
          db,
        );
      };

    beforeAll(
      async () => {

        /*
         * Defensive cleanup from an interrupted run.
         */
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
            'Nutrition Integration Creator',
            'member',
            current_timestamp
          ),
          (
            ${targetUserId},
            'Nutrition Integration Target',
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
      'creates one weekly plan with exactly seven persisted days',
      async () => {

        const result =
          await createWeeklyPlan(
            unitOfWork,
            {
              title:
                weeklyTitle,

              weekStart:
                '2026-09-21',

              createdByUserId:
                creatorUserId,
            },
          );

        expect(
          result.plan,
        ).toMatchObject({
          title:
            weeklyTitle,

          startDate:
            '2026-09-21',

          endDate:
            '2026-09-27',

          status:
            'DRAFT',

          createdByUserId:
            creatorUserId,
        });

        expect(
          result.days.map(
            day =>
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

        const persistedPlan =
          await db
            .selectFrom(
              'nutrition.plans',
            )
            .selectAll()
            .where(
              'id',
              '=',
              result.plan.id,
            )
            .executeTakeFirstOrThrow();

        expect(
          persistedPlan.title,
        ).toBe(
          weeklyTitle,
        );

        const persistedDays =
          await db
            .selectFrom(
              'nutrition.days',
            )
            .select([
              'date',
            ])
            .where(
              'plan_id',
              '=',
              result.plan.id,
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

        expect(
          persistedDays.map(
            row => {

              if (
                row.date instanceof
                Date
              ) {
                const year =
                  row.date.getFullYear();

                const month =
                  String(
                    row.date.getMonth() +
                      1,
                  ).padStart(
                    2,
                    '0',
                  );

                const day =
                  String(
                    row.date.getDate(),
                  ).padStart(
                    2,
                    '0',
                  );

                return `${year}-${month}-${day}`;
              }

              return row.date;
            },
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
      'persists and upserts plan targets without creating duplicates',
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
              weeklyTitle,
            )
            .executeTakeFirstOrThrow();

        const planId =
          plan.id as
            NutritionPlanId;

        const first =
          await setPlanTarget(
            unitOfWork,
            {
              planId,

              userId:
                targetUserId,

              caloriesKcal:
                3400.5,

              proteinG:
                185.25,

              carbohydratesG:
                450.75,

              fatG:
                90.5,

              fiberG:
                35.25,
            },
          );

        expect(
          first,
        ).toMatchObject({
          planId,

          userId:
            targetUserId,

          caloriesKcal:
            3400.5,

          proteinG:
            185.25,

          carbohydratesG:
            450.75,

          fatG:
            90.5,

          fiberG:
            35.25,
        });

        const second =
          await setPlanTarget(
            unitOfWork,
            {
              planId,

              userId:
                targetUserId,

              caloriesKcal:
                3600.75,

              proteinG:
                190.5,

              carbohydratesG:
                480.25,

              fatG:
                95.75,

              fiberG:
                null,
            },
          );

        /*
         * UPSERT must update the same logical target.
         */
        expect(
          second.id,
        ).toBe(
          first.id,
        );

        expect(
          second,
        ).toMatchObject({
          caloriesKcal:
            3600.75,

          proteinG:
            190.5,

          carbohydratesG:
            480.25,

          fatG:
            95.75,

          fiberG:
            null,
        });

        const persistedTargets =
          await db
            .selectFrom(
              'nutrition.plan_targets',
            )
            .selectAll()
            .where(
              'plan_id',
              '=',
              planId,
            )
            .where(
              'user_id',
              '=',
              targetUserId,
            )
            .execute();

        expect(
          persistedTargets,
        ).toHaveLength(
          1,
        );

        const persisted =
          persistedTargets[0];

        expect(
          persisted,
        ).toBeDefined();

        if (!persisted) {
          throw new Error(
            'Nutrition target was not persisted',
          );
        }

        /*
         * PostgreSQL numeric is intentionally represented
         * as strings at the DB boundary.
         */
        expect(
          Number(
            persisted.calories_kcal,
          ),
        ).toBe(
          3600.75,
        );

        expect(
          Number(
            persisted.protein_g,
          ),
        ).toBe(
          190.5,
        );

        expect(
          Number(
            persisted.carbohydrates_g,
          ),
        ).toBe(
          480.25,
        );

        expect(
          Number(
            persisted.fat_g,
          ),
        ).toBe(
          95.75,
        );

        expect(
          persisted.fiber_g,
        ).toBeNull();
      },
    );

    it(
      'rolls back work when a later operation inside the unit of work fails',
      async () => {

        await expect(
          unitOfWork.execute(
            async ({
              plans,
            }) => {

              await plans.create({
                title:
                  atomicityTitle,

                startDate:
                  '2026-10-05',

                endDate:
                  '2026-10-11',

                status:
                  'DRAFT',

                createdByUserId:
                  creatorUserId,
              });

              /*
               * Simulates a later domain/repository failure.
               * The previous INSERT must not survive.
               */
              throw new Error(
                'Controlled Nutrition transaction failure',
              );
            },
          ),
        ).rejects.toThrow(
          'Controlled Nutrition transaction failure',
        );

        const persistedPlan =
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
              atomicityTitle,
            )
            .executeTakeFirst();

        expect(
          persistedPlan,
        ).toBeUndefined();
      },
    );
  },
);
