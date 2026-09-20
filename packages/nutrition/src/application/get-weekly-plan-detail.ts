import type {
  DkturboUserId,
  NutritionDay,
  NutritionMealDetail,
  NutritionMealUserTotals,
  NutritionNutrients,
  NutritionPlan,
  NutritionPlanId,
  NutritionPlanTarget,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  addNutrients,
  calculateMealTotalsByUser,
  emptyNutrients,
  roundNutrients,
} from './nutrition-calculations.js';

export interface NutritionTargetRemaining {
  caloriesKcal:
    number | null;

  proteinG:
    number | null;

  carbohydratesG:
    number | null;

  fatG:
    number | null;

  fiberG:
    number | null;
}

export interface NutritionDailyUserProgress {
  userId:
    DkturboUserId;

  planned:
    NutritionNutrients;

  target:
    NutritionPlanTarget | null;

  remaining:
    NutritionTargetRemaining;
}

export interface NutritionWeeklyDayDetail {
  day:
    NutritionDay;

  meals:
    NutritionMealDetail[];

  dailyTotalsByUser:
    NutritionMealUserTotals[];

  progressByUser:
    NutritionDailyUserProgress[];
}

export interface NutritionWeeklyPlanDetail {
  plan:
    NutritionPlan;

  targets:
    NutritionPlanTarget[];

  days:
    NutritionWeeklyDayDetail[];

  weeklyTotalsByUser:
    NutritionMealUserTotals[];
}

export class NutritionPlanNotFoundForDetailError
extends Error {}

const totalsToMap =
  (
    totals:
      NutritionMealUserTotals[],
  ): Map<
    DkturboUserId,
    NutritionNutrients
  > =>
    new Map(
      totals.map(
        total => [
          total.userId,
          total.nutrients,
        ],
      ),
    );

const calculateRemaining =
  (
    target:
      NutritionPlanTarget,

    planned:
      NutritionNutrients,
  ): NutritionTargetRemaining => ({
    caloriesKcal:
      target.caloriesKcal ===
        null
        ? null
        : Math.round(
            (
              target.caloriesKcal -
              planned.caloriesKcal
            ) *
              100,
          ) /
          100,

    proteinG:
      target.proteinG ===
        null
        ? null
        : Math.round(
            (
              target.proteinG -
              planned.proteinG
            ) *
              100,
          ) /
          100,

    carbohydratesG:
      target.carbohydratesG ===
        null
        ? null
        : Math.round(
            (
              target.carbohydratesG -
              planned.carbohydratesG
            ) *
              100,
          ) /
          100,

    fatG:
      target.fatG ===
        null
        ? null
        : Math.round(
            (
              target.fatG -
              planned.fatG
            ) *
              100,
          ) /
          100,

    fiberG:
      target.fiberG ===
        null
        ? null
        : Math.round(
            (
              target.fiberG -
              planned.fiberG
            ) *
              100,
          ) /
          100,
  });

export const getWeeklyPlanDetail =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    planId:
      NutritionPlanId,
  ): Promise<NutritionWeeklyPlanDetail> =>
    unitOfWork.execute(
      async ({
        plans,
        planTargets,
        days,
        meals,
        mealItems,
      }) => {

        const plan =
          await plans.findById(
            planId,
          );

        if (!plan) {
          throw new NutritionPlanNotFoundForDetailError(
            'Nutrition plan not found',
          );
        }

        const targets =
          await planTargets
            .listForPlan(
              plan.id,
            );

        const planDays =
          await days.listForPlan(
            plan.id,
          );

        const weeklyTotals =
          new Map<
            DkturboUserId,
            NutritionNutrients
          >();

        const detailedDays:
          NutritionWeeklyDayDetail[] = [];

        for (
          const day of
            planDays
        ) {
          if (
            day.planId !==
            plan.id
          ) {
            throw new Error(
              'Nutrition day does not belong to plan',
            );
          }

          const dayMeals =
            await meals.listForDay(
              day.id,
            );

          const detailedMeals:
            NutritionMealDetail[] = [];

          const dailyTotals =
            new Map<
              DkturboUserId,
              NutritionNutrients
            >();

          for (
            const meal of
              dayMeals
          ) {
            if (
              meal.dayId !==
              day.id
            ) {
              throw new Error(
                'Nutrition meal does not belong to day',
              );
            }

            const items =
              await mealItems
                .listDetailsForMeal(
                  meal.id,
                );

            for (
              const detail of
                items
            ) {
              if (
                detail.item.mealId !==
                meal.id
              ) {
                throw new Error(
                  'Nutrition meal item does not belong to meal',
                );
              }

              if (
                detail.item.foodId !==
                detail.food.id
              ) {
                throw new Error(
                  'Nutrition meal item food mismatch',
                );
              }
            }

            const mealTotals =
              calculateMealTotalsByUser(
                items,
              );

            detailedMeals.push({
              meal,
              items,

              totalsByUser:
                mealTotals,
            });

            for (
              const total of
                mealTotals
            ) {
              const current =
                dailyTotals.get(
                  total.userId,
                ) ??
                emptyNutrients();

              dailyTotals.set(
                total.userId,
                addNutrients(
                  current,
                  total.nutrients,
                ),
              );
            }
          }

          const dailyTotalsByUser =
            Array.from(
              dailyTotals.entries(),
            ).map(
              ([
                userId,
                nutrients,
              ]) => ({
                userId,

                nutrients:
                  roundNutrients(
                    nutrients,
                  ),
              }),
            );

          for (
            const total of
              dailyTotalsByUser
          ) {
            const current =
              weeklyTotals.get(
                total.userId,
              ) ??
              emptyNutrients();

            weeklyTotals.set(
              total.userId,
              addNutrients(
                current,
                total.nutrients,
              ),
            );
          }

          const dailyTotalsMap =
            totalsToMap(
              dailyTotalsByUser,
            );

          const relevantUserIds =
            new Set<
              DkturboUserId
            >();

          for (
            const target of
              targets
          ) {
            relevantUserIds.add(
              target.userId,
            );
          }

          for (
            const total of
              dailyTotalsByUser
          ) {
            relevantUserIds.add(
              total.userId,
            );
          }

          const progressByUser =
            Array.from(
              relevantUserIds,
            ).map(
              userId => {

                const planned =
                  dailyTotalsMap.get(
                    userId,
                  ) ??
                  emptyNutrients();

                const target =
                  targets.find(
                    candidate =>
                      candidate.userId ===
                      userId,
                  ) ??
                  null;

                return {
                  userId,

                  planned,

                  target,

                  remaining:
                    target
                      ? calculateRemaining(
                          target,
                          planned,
                        )
                      : {
                          caloriesKcal:
                            null,

                          proteinG:
                            null,

                          carbohydratesG:
                            null,

                          fatG:
                            null,

                          fiberG:
                            null,
                        },
                };
              },
            );

          detailedDays.push({
            day,

            meals:
              detailedMeals,

            dailyTotalsByUser,

            progressByUser,
          });
        }

        return {
          plan,

          targets,

          days:
            detailedDays,

          weeklyTotalsByUser:
            Array.from(
              weeklyTotals.entries(),
            ).map(
              ([
                userId,
                nutrients,
              ]) => ({
                userId,

                nutrients:
                  roundNutrients(
                    nutrients,
                  ),
              }),
            ),
        };
      },
    );
