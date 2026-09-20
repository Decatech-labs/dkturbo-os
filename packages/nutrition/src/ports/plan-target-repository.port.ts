import type {
  DkturboUserId,
  NutritionPlanId,
  NutritionPlanTarget,
} from '../domain/index.js';

export interface SaveNutritionPlanTargetData {
  planId:
    NutritionPlanId;

  userId:
    DkturboUserId;

  caloriesKcal:
    number | null;

  proteinG:
    number | null;

  carbohydratesG:
    number | null;

  fatG:
    number | null;

  fiberG:
    number | null;
}

export interface PlanTargetRepository {
  save(
    data:
      SaveNutritionPlanTargetData,
  ): Promise<NutritionPlanTarget>;

  findForUser(
    planId:
      NutritionPlanId,

    userId:
      DkturboUserId,
  ): Promise<NutritionPlanTarget | null>;

  listForPlan(
    planId:
      NutritionPlanId,
  ): Promise<NutritionPlanTarget[]>;
}
