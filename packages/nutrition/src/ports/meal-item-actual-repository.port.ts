import type {
  DkturboUserId,
  NutritionDayId,
  NutritionFoodId,
  NutritionMealItemActual,
  NutritionMealItemActualStatus,
  NutritionMealItemId,
  NutritionFoodSnapshot,
} from '../domain/index.js';

export interface SaveMealItemActualData {
  dayId:
    NutritionDayId;

  mealItemId:
    NutritionMealItemId;

  userId:
    DkturboUserId;

  status:
    NutritionMealItemActualStatus;

  plannedFoodId:
    NutritionFoodId;

  plannedFoodSnapshot:
    NutritionFoodSnapshot;

  plannedQuantity:
    number;

  actualFoodId:
    NutritionFoodId | null;

  actualFoodSnapshot:
    NutritionFoodSnapshot | null;

  actualQuantity:
    number | null;

  notes:
    string | null;
}

export interface MealItemActualRepository {
  save(
    data:
      SaveMealItemActualData,
  ): Promise<NutritionMealItemActual>;

  findForItemAndUser(
    mealItemId:
      NutritionMealItemId,

    userId:
      DkturboUserId,
  ): Promise<NutritionMealItemActual | null>;

  deleteForItemAndUser(
    mealItemId:
      NutritionMealItemId,

    userId:
      DkturboUserId,
  ): Promise<boolean>;

  listForDay(
    dayId:
      NutritionDayId,
  ): Promise<NutritionMealItemActual[]>;

  listForDayAndUser(
    dayId:
      NutritionDayId,

    userId:
      DkturboUserId,
  ): Promise<NutritionMealItemActual[]>;
}
