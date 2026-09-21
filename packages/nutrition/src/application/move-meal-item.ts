import type {
  NutritionMealId,
  NutritionMealItemId,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

export interface MoveMealItemInput {
  mealItemId:
    NutritionMealItemId;

  targetMealId:
    NutritionMealId;

  targetPosition:
    number;
}

export class NutritionMealItemNotFoundError
extends Error {}

export class InvalidNutritionMealItemMoveError
extends Error {}

export const moveMealItem =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      MoveMealItemInput,
  ): Promise<void> => {

    if (
      !Number.isInteger(
        input.targetPosition,
      ) ||
      input.targetPosition <
        0
    ) {
      throw new InvalidNutritionMealItemMoveError(
        'Invalid target position',
      );
    }

    await unitOfWork.execute(
      async ({
        meals,
        mealItems,
      }) => {

        const item =
          await mealItems.findById(
            input.mealItemId,
          );

        if (!item) {
          throw new NutritionMealItemNotFoundError(
            'Nutrition meal item not found',
          );
        }

        const [
          sourceMeal,
          targetMeal,
        ] =
          await Promise.all([
            meals.findById(
              item.mealId,
            ),

            meals.findById(
              input.targetMealId,
            ),
          ]);

        if (
          !sourceMeal ||
          !targetMeal
        ) {
          throw new InvalidNutritionMealItemMoveError(
            'Nutrition meal not found',
          );
        }

        if (
          sourceMeal.dayId !==
          targetMeal.dayId
        ) {
          throw new InvalidNutritionMealItemMoveError(
            'Meal items can only be moved within the same day',
          );
        }

        const sourceItems =
          await mealItems
            .listDetailsForMeal(
              sourceMeal.id,
            );

        const sameMeal =
          sourceMeal.id ===
          targetMeal.id;

        if (sameMeal) {

          const ordered =
            sourceItems
              .filter(
                detail =>
                  detail.item.id !==
                  item.id,
              );

          const position =
            Math.min(
              input.targetPosition,
              ordered.length,
            );

          ordered.splice(
            position,
            0,
            sourceItems.find(
              detail =>
                detail.item.id ===
                item.id,
            )!,
          );

          await mealItems.setLocations(
            ordered.map(
              (
                detail,
                index,
              ) => ({
                mealItemId:
                  detail.item.id,

                mealId:
                  sourceMeal.id,

                position:
                  index,
              }),
            ),
          );

          return;
        }

        const targetItems =
          await mealItems
            .listDetailsForMeal(
              targetMeal.id,
            );

        const remainingSource =
          sourceItems.filter(
            detail =>
              detail.item.id !==
              item.id,
          );

        const destination =
          [
            ...targetItems,
          ];

        const position =
          Math.min(
            input.targetPosition,
            destination.length,
          );

        const movingDetail =
          sourceItems.find(
            detail =>
              detail.item.id ===
              item.id,
          );

        if (!movingDetail) {
          throw new NutritionMealItemNotFoundError(
            'Nutrition meal item not found',
          );
        }

        destination.splice(
          position,
          0,
          movingDetail,
        );

        await mealItems.setLocations([
          ...remainingSource.map(
            (
              detail,
              index,
            ) => ({
              mealItemId:
                detail.item.id,

              mealId:
                sourceMeal.id,

              position:
                index,
            }),
          ),

          ...destination.map(
            (
              detail,
              index,
            ) => ({
              mealItemId:
                detail.item.id,

              mealId:
                targetMeal.id,

              position:
                index,
            }),
          ),
        ]);
      },
    );
  };
