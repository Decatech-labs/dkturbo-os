import type {
  NutritionDayId,
  NutritionMeal,
  NutritionMealId,
} from '../domain/index.js';

export interface CreateNutritionMealData {
  dayId:
    NutritionDayId;

  name:
    string;

  plannedTime:
    string | null;

  position:
    number;

  notes:
    string | null;
}

export interface UpdateNutritionMealData {
  mealId:
    NutritionMealId;

  name:
    string;

  plannedTime:
    string | null;

  position:
    number;

  notes:
    string | null;
}

export interface MealRepository {
  create(
    data:
      CreateNutritionMealData,
  ): Promise<NutritionMeal>;

  update(
    data:
      UpdateNutritionMealData,
  ): Promise<NutritionMeal | null>;

  delete(
    mealId:
      NutritionMealId,
  ): Promise<boolean>;

  findById(
    mealId:
      NutritionMealId,
  ): Promise<NutritionMeal | null>;

  listForDay(
    dayId:
      NutritionDayId,
  ): Promise<NutritionMeal[]>;
}
