import type {
  DkturboUserId,
  NutritionMealId,
  NutritionMealItem,
  NutritionMealItemDetail,
  NutritionMealItemId,
  NutritionFoodId,
  NutritionFoodSnapshot,
} from '../domain/index.js';

export interface AddNutritionMealItemData {
  mealId:
    NutritionMealId;

  foodId:
    NutritionFoodId;

  foodSnapshot:
    NutritionFoodSnapshot;

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

  findById(
    mealItemId:
      NutritionMealItemId,
  ): Promise<NutritionMealItem | null>;

  setLocations(
    data:
      SetMealItemLocationData[],
  ): Promise<void>;

  delete(
    mealItemId:
      NutritionMealItemId,
  ): Promise<boolean>;

  saveQuantities(
    data:
      SaveMealItemQuantityData[],
  ): Promise<void>;

  listDetailsForMeal(
    mealId:
      NutritionMealId,
  ): Promise<NutritionMealItemDetail[]>;
}

export interface SetMealItemLocationData {
  mealItemId:
    NutritionMealItemId;

  mealId:
    NutritionMealId;

  position:
    number;
}