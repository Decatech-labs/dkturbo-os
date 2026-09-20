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

export interface MealRepository {
  create(
    data:
      CreateNutritionMealData,
  ): Promise<NutritionMeal>;

  findById(
    mealId:
      NutritionMealId,
  ): Promise<NutritionMeal | null>;

  listForDay(
    dayId:
      NutritionDayId,
  ): Promise<NutritionMeal[]>;
}
