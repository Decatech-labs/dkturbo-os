import type {
  DkturboUserId,
  NutritionPersonAccess,
  NutritionPersonAccessRole,
} from '../domain/index.js';

export interface GrantNutritionPersonAccessData {
  granteeUserId:
    DkturboUserId;

  subjectUserId:
    DkturboUserId;

  role:
    NutritionPersonAccessRole;
}

export interface PersonAccessRepository {
  findAccess(
    granteeUserId:
      DkturboUserId,

    subjectUserId:
      DkturboUserId,
  ): Promise<
    NutritionPersonAccess | null
  >;

  listForGrantee(
    granteeUserId:
      DkturboUserId,
  ): Promise<
    NutritionPersonAccess[]
  >;

  grantAccess(
    data:
      GrantNutritionPersonAccessData,
  ): Promise<
    NutritionPersonAccess
  >;

  revokeAccess(
    granteeUserId:
      DkturboUserId,

    subjectUserId:
      DkturboUserId,
  ): Promise<boolean>;
}
