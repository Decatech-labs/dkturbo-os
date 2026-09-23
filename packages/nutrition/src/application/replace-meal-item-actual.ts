import type {
  DkturboUserId,
  NutritionFoodId,
  NutritionMealItemActual,
  NutritionMealItemId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  NutritionFoodNotFoundError,
} from './add-food-to-meal.js';

import {
  getMealItemActualContext,
} from './meal-item-actual-context.js';

import {
  snapshotNutritionFood,
} from './food-snapshot.js';

export class InvalidNutritionMealItemActualQuantityError
extends Error {}

export class ArchivedNutritionReplacementFoodError
extends Error {}

export interface ReplaceMealItemActualInput {
  mealItemId:
    NutritionMealItemId;

  userId:
    DkturboUserId;

  actualFoodId:
    NutritionFoodId;

  actualQuantity:
    number;

  notes:
    string | null;
}

export const replaceMealItemActual =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      ReplaceMealItemActualInput,
  ): Promise<NutritionMealItemActual> => {

    if (
      !Number.isFinite(
        input.actualQuantity,
      ) ||
      input.actualQuantity <=
        0
    ) {
      throw new InvalidNutritionMealItemActualQuantityError(
        'Actual quantity must be greater than zero',
      );
    }

    const context =
      await getMealItemActualContext(
        unitOfWork,
        input,
      );

    const replacementFood =
      await unitOfWork.execute(
        async ({
          foods,
        }) =>
          foods.findById(
            input.actualFoodId,
          ),
      );

    if (!replacementFood) {
      throw new NutritionFoodNotFoundError(
        'Replacement food not found',
      );
    }

    if (
      replacementFood.archivedAt !==
      null
    ) {
      throw new ArchivedNutritionReplacementFoodError(
        'Archived food cannot be used as a replacement',
      );
    }

    return unitOfWork.execute(
      async ({
        mealItemActuals,
      }) =>
        mealItemActuals.save({
          dayId:
            context.dayId,

          mealItemId:
            input.mealItemId,

          userId:
            input.userId,

          status:
            'REPLACED',

          plannedFoodId:
            context.detail.food.id,

          plannedFoodSnapshot:
            snapshotNutritionFood(
              context.detail.food,
            ),

          plannedQuantity:
            context.quantity.quantity,

          actualFoodId:
            replacementFood.id,

          actualFoodSnapshot:
            snapshotNutritionFood(
              replacementFood,
            ),

          actualQuantity:
            input.actualQuantity,

          notes:
            input.notes?.trim() ||
            null,
        }),
    );
  };
