import type {
  NutritionFoodId,
  NutritionFoodPreparationConversion,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  FoodPreparationConversionFoodNotFoundError,
} from './create-food-preparation-conversion.js';

export const listFoodPreparationConversions =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    foodId:
      NutritionFoodId,
  ): Promise<NutritionFoodPreparationConversion[]> =>

    unitOfWork.execute(
      async ({
        foods,
        foodPreparationConversions,
      }) => {

        const food =
          await foods.findById(
            foodId,
          );

        if (!food) {
          throw new FoodPreparationConversionFoodNotFoundError(
            'Nutrition food not found',
          );
        }

        return foodPreparationConversions.listForFood(
          foodId,
        );
      },
    );
