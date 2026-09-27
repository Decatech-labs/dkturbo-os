import type {
  DkturboUserId,
  NutritionPersonAccessRole,
} from '../domain/index.js';

import type {
  PersonAccessRepository,
} from '../ports/index.js';

export class NutritionPersonReadAccessDeniedError
extends Error {}

export class NutritionPersonManageAccessDeniedError
extends Error {}

export const getEffectiveNutritionPersonAccess =
  async (
    repository:
      PersonAccessRepository,

    actorUserId:
      DkturboUserId,

    subjectUserId:
      DkturboUserId,
  ): Promise<
    NutritionPersonAccessRole
  > => {

    if (
      actorUserId ===
      subjectUserId
    ) {
      return 'MANAGER';
    }

    const access =
      await repository.findAccess(
        actorUserId,
        subjectUserId,
      );

    if (!access) {
      throw new NutritionPersonReadAccessDeniedError(
        'Nutrition person read access denied',
      );
    }

    return access.role;
  };

export const requireNutritionPersonReadAccess =
  async (
    repository:
      PersonAccessRepository,

    actorUserId:
      DkturboUserId,

    subjectUserId:
      DkturboUserId,
  ): Promise<void> => {

    await getEffectiveNutritionPersonAccess(
      repository,
      actorUserId,
      subjectUserId,
    );
  };

export const requireNutritionPersonManageAccess =
  async (
    repository:
      PersonAccessRepository,

    actorUserId:
      DkturboUserId,

    subjectUserId:
      DkturboUserId,
  ): Promise<void> => {

    const role =
      await getEffectiveNutritionPersonAccess(
        repository,
        actorUserId,
        subjectUserId,
      );

    if (
      role !==
      'MANAGER'
    ) {
      throw new NutritionPersonManageAccessDeniedError(
        'Nutrition person manage access denied',
      );
    }
  };
