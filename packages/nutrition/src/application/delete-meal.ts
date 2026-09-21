import type {
  NutritionMealId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  NutritionMealNotFoundError,
} from './add-food-to-meal.js';

export interface DeleteMealInput {
  mealId:
    NutritionMealId;
}

export const deleteMeal =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      DeleteMealInput,
  ): Promise<void> => {

    await unitOfWork.execute(
      async ({
        meals,
      }) => {

        const deleted =
          await meals.delete(
            input.mealId,
          );

        if (!deleted) {
          throw new NutritionMealNotFoundError(
            'Nutrition meal not found',
          );
        }
      },
    );
  };
