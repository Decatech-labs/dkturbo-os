import type {
  NutritionFoodId,
  NutritionFoodPreparationConversion,
  NutritionFoodPreparationConversionId,
  NutritionUnit,
} from '../domain/index.js';

export interface CreateFoodPreparationConversionData {
  foodId:
    NutritionFoodId;

  name:
    string;

  rawAmount:
    number;

  preparedAmount:
    number;

  preparedUnit:
    NutritionUnit;

  isDefault:
    boolean;
}

export interface UpdateFoodPreparationConversionData {
  conversionId:
    NutritionFoodPreparationConversionId;

  name:
    string;

  rawAmount:
    number;

  preparedAmount:
    number;

  preparedUnit:
    NutritionUnit;

  isDefault:
    boolean;
}

export interface FoodPreparationConversionRepository {
  create(
    data:
      CreateFoodPreparationConversionData,
  ): Promise<NutritionFoodPreparationConversion>;

  update(
    data:
      UpdateFoodPreparationConversionData,
  ): Promise<NutritionFoodPreparationConversion | null>;

  delete(
    conversionId:
      NutritionFoodPreparationConversionId,
  ): Promise<boolean>;

  findById(
    conversionId:
      NutritionFoodPreparationConversionId,
  ): Promise<NutritionFoodPreparationConversion | null>;

  findDefaultForFood(
    foodId:
      NutritionFoodId,
  ): Promise<NutritionFoodPreparationConversion | null>;

  listForFood(
    foodId:
      NutritionFoodId,
  ): Promise<NutritionFoodPreparationConversion[]>;
}
