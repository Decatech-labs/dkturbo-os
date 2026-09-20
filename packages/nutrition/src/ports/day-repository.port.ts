import type {
  NutritionDay,
  NutritionPlanId,
} from '../domain/index.js';

export interface CreateNutritionDayData {
  planId:
    NutritionPlanId;

  date:
    string;

  notes:
    string | null;
}

export interface DayRepository {
  createMany(
    data:
      CreateNutritionDayData[],
  ): Promise<NutritionDay[]>;

  listForPlan(
    planId:
      NutritionPlanId,
  ): Promise<NutritionDay[]>;
}
