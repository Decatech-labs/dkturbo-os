import type {
  NutritionFoodPreparationConversionId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  FoodPreparationConversionNotFoundError,
} from './update-food-preparation-conversion.js';

export interface DeleteFoodPreparationConversionInput {
  conversionId:
    NutritionFoodPreparationConversionId;
}

export const deleteFoodPreparationConversion =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      DeleteFoodPreparationConversionInput,
  ): Promise<void> =>

    unitOfWork.execute(
      async ({
        foodPreparationConversions,
      }) => {

        const deleted =
          await foodPreparationConversions.delete(
            input.conversionId,
          );

        if (!deleted) {
          throw new FoodPreparationConversionNotFoundError(
            'Food preparation conversion not found',
          );
        }
      },
    );
