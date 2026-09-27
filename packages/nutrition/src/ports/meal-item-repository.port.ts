import type {
  DkturboUserId,
  NutritionMealId,
  NutritionMealItem,
  NutritionMealItemDetail,
  NutritionMealItemId,
  NutritionFoodId,
  NutritionFoodSnapshot,
  NutritionFoodPreparationConversionId,
} from '../domain/index.js';

export interface AddNutritionMealItemData {
  mealId:
    NutritionMealId;

  foodId:
    NutritionFoodId;

  preparationConversionId:
    NutritionFoodPreparationConversionId | null;

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

  setPreparationConversion(
    mealItemId:
      NutritionMealItemId,

    preparationConversionId:
      NutritionFoodPreparationConversionId | null,
  ): Promise<boolean>;

  delete(
    mealItemId:
      NutritionMealItemId,
  ): Promise<boolean>;

  saveQuantities(
    data:
      SaveMealItemQuantityData[],
  ): Promise<void>;

  deleteQuantity(
    mealItemId:
      NutritionMealItemId,

    userId:
      DkturboUserId,
  ): Promise<boolean>;

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