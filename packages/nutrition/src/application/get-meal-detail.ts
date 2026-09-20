import type {
  NutritionMealDetail,
  NutritionMealId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  NutritionMealNotFoundError,
} from './add-food-to-meal.js';

import {
  calculateMealTotalsByUser,
} from './nutrition-calculations.js';

export const getMealDetail =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    mealId:
      NutritionMealId,
  ): Promise<NutritionMealDetail> =>
    unitOfWork.execute(
      async ({
        meals,
        mealItems,
      }) => {

        const meal =
          await meals.findById(
            mealId,
          );

        if (!meal) {
          throw new NutritionMealNotFoundError(
            'Nutrition meal not found',
          );
        }

        const items =
          await mealItems
            .listDetailsForMeal(
              mealId,
            );

        return {
          meal,
          items,

          totalsByUser:
            calculateMealTotalsByUser(
              items,
            ),
        };
      },
    );
