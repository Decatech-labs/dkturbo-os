import type {
  DkturboUserId,
  NutritionFoodId,
  NutritionMealId,
  NutritionMealItemDetail,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

import {
  snapshotNutritionFood,
} from './food-snapshot.js';

export interface MealFoodQuantityInput {
  userId:
    DkturboUserId;

  quantity:
    number;
}

export interface AddFoodToMealInput {
  mealId:
    NutritionMealId;

  foodId:
    NutritionFoodId;

  position:
    number;

  notes:
    string | null;

  quantities:
    MealFoodQuantityInput[];
}

export class InvalidMealFoodError
extends Error {}

export class NutritionMealNotFoundError
extends Error {}

export class NutritionFoodNotFoundError
extends Error {}

export const addFoodToMeal =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      AddFoodToMealInput,
  ): Promise<NutritionMealItemDetail> => {

    if (
      !Number.isInteger(
        input.position,
      ) ||
      input.position <
        0
    ) {
      throw new InvalidMealFoodError(
        'Invalid meal item position',
      );
    }

    const seenUsers =
      new Set<string>();

    for (
      const quantity of
        input.quantities
    ) {
      if (
        seenUsers.has(
          quantity.userId,
        )
      ) {
        throw new InvalidMealFoodError(
          'Duplicate user quantity',
        );
      }

      seenUsers.add(
        quantity.userId,
      );

      if (
        !Number.isFinite(
          quantity.quantity,
        ) ||
        quantity.quantity <
          0
      ) {
        throw new InvalidMealFoodError(
          'Invalid food quantity',
        );
      }
    }

    return unitOfWork.execute(
      async ({
        meals,
        foods,
        mealItems,
      }) => {

        const meal =
          await meals.findById(
            input.mealId,
          );

        if (!meal) {
          throw new NutritionMealNotFoundError(
            'Nutrition meal not found',
          );
        }

        const food =
          await foods.findById(
            input.foodId,
          );

        if (
          !food ||
          food.archivedAt !==
            null
        ) {
          throw new NutritionFoodNotFoundError(
            'Nutrition food not found',
          );
        }

        const item =
          await mealItems.create({
            mealId:
              input.mealId,

            foodId:
              input.foodId,

            foodSnapshot:
              snapshotNutritionFood(
                food,
              ),

            position:
              input.position,

            notes:
              input.notes
                ?.trim() ||
              null,
          });

        await mealItems.saveQuantities(
          input.quantities.map(
            quantity => ({
              mealItemId:
                item.id,

              userId:
                quantity.userId,

              quantity:
                quantity.quantity,
            }),
          ),
        );

        const details =
          await mealItems
            .listDetailsForMeal(
              input.mealId,
            );

        const detail =
          details.find(
            candidate =>
              candidate.item.id ===
              item.id,
          );

        if (!detail) {
          throw new Error(
            'Created Nutrition meal item could not be reloaded',
          );
        }

        return detail;
      },
    );
  };
