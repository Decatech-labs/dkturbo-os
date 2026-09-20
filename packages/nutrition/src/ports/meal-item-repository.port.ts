import type {
  DkturboUserId,
  NutritionMealId,
  NutritionMealItem,
  NutritionMealItemDetail,
  NutritionMealItemId,
  NutritionFoodId,
} from '../domain/index.js';

export interface AddNutritionMealItemData {
  mealId:
    NutritionMealId;

  foodId:
    NutritionFoodId;

  position:
    number;

  notes:
    string | null;
}

export interface SaveMealItemQuantityData {
  mealItemId:
    NutritionMealItemId;

  userId:
    DkturboUserId;

  quantity:
    number;
}

export interface MealItemRepository {
  create(
    data:
      AddNutritionMealItemData,
  ): Promise<NutritionMealItem>;

  saveQuantities(
    data:
      SaveMealItemQuantityData[],
  ): Promise<void>;

  listDetailsForMeal(
    mealId:
      NutritionMealId,
  ): Promise<NutritionMealItemDetail[]>;
}
