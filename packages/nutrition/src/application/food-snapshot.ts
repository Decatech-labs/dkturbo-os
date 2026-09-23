import type {
  NutritionFood,
  NutritionFoodSnapshot,
} from '../domain/index.js';

export const snapshotNutritionFood =
  (
    food:
      NutritionFood,
  ): NutritionFoodSnapshot => ({
    name:
      food.name,

    brand:
      food.brand,

    category:
      food.category,

    referenceAmount:
      food.referenceAmount,

    referenceUnit:
      food.referenceUnit,

    caloriesKcal:
      food.caloriesKcal,

    proteinG:
      food.proteinG,

    carbohydratesG:
      food.carbohydratesG,

    fatG:
      food.fatG,

    fiberG:
      food.fiberG,
  });
