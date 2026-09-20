import type {
  DkturboUserId,
  NutritionPlan,
  NutritionPlanId,
  NutritionPlanStatus,
} from '../domain/index.js';

export interface CreateNutritionPlanData {
  title:
    string;

  startDate:
    string;

  endDate:
    string;

  status:
    NutritionPlanStatus;

  createdByUserId:
    DkturboUserId;
}

export interface PlanRepository {
  create(
    data:
      CreateNutritionPlanData,
  ): Promise<NutritionPlan>;

  findById(
    planId:
      NutritionPlanId,
  ): Promise<NutritionPlan | null>;

  list():
    Promise<NutritionPlan[]>;
}
