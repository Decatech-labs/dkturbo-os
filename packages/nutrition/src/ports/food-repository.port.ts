import type {
  DkturboUserId,
  NutritionFood,
  NutritionFoodId,
  NutritionUnit,
} from '../domain/index.js';

export interface CreateFoodData {
  name:
    string;

  brand:
    string | null;

  referenceAmount:
    number;

  referenceUnit:
    NutritionUnit;

  caloriesKcal:
    number;

  proteinG:
    number;

  carbohydratesG:
    number;

  fatG:
    number;

  fiberG:
    number | null;

  createdByUserId:
    DkturboUserId;
}

export interface FoodRepository {
  create(
    data:
      CreateFoodData,
  ): Promise<NutritionFood>;

  findById(
    foodId:
      NutritionFoodId,
  ): Promise<NutritionFood | null>;

  searchActive(
    query:
      string,
  ): Promise<NutritionFood[]>;
}
