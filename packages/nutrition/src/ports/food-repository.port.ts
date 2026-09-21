import type {
  DkturboUserId,
  NutritionFood,
  NutritionFoodId,
  NutritionUnit,
  NutritionFoodCategory,
} from '../domain/index.js';

export interface CreateFoodData {
  name:
    string;

  brand:
    string | null;

  category:
    NutritionFoodCategory;

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

export interface UpdateFoodData {
  foodId:
    NutritionFoodId;

  name:
    string;

  brand:
    string | null;

  category:
    NutritionFoodCategory;

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

  update(
    data:
      UpdateFoodData,
  ): Promise<NutritionFood | null>;

  archive(
    foodId:
      NutritionFoodId,
  ): Promise<boolean>;

  searchActive(
    query:
      string,

    category:
      NutritionFoodCategory | null,
  ): Promise<NutritionFood[]>;
}
