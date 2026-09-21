import type {
  NutritionFoodId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  NutritionFoodNotFoundError,
} from './add-food-to-meal.js';

export interface ArchiveFoodInput {
  foodId:
    NutritionFoodId;
}

export const archiveFood =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      ArchiveFoodInput,
  ): Promise<void> => {

    await unitOfWork.execute(
      async ({
        foods,
      }) => {

        const archived =
          await foods.archive(
            input.foodId,
          );

        if (!archived) {
          throw new NutritionFoodNotFoundError(
            'Nutrition food not found',
          );
        }
      },
    );
  };
