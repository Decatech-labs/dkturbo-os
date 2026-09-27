import type {
  DkturboUserId,
  NutritionPersonAccess,
  NutritionPersonAccessRole,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

export class NutritionSelfAccessAdministrationError
extends Error {}

export interface SetNutritionPersonAccessAdministrationInput {
  granteeUserId:
    DkturboUserId;

  subjectUserId:
    DkturboUserId;

  role:
    NutritionPersonAccessRole | null;
}

export interface SetNutritionPersonAccessAdministrationResult {
  access:
    NutritionPersonAccess | null;
}

export const setNutritionPersonAccessAdministration =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      SetNutritionPersonAccessAdministrationInput,
  ): Promise<
    SetNutritionPersonAccessAdministrationResult
  > =>
    unitOfWork.execute(
      async ({
        personAccess,
      }) => {

        if (
          input.granteeUserId ===
          input.subjectUserId
        ) {
          throw new NutritionSelfAccessAdministrationError(
            'Self Nutrition access is implicit and cannot be administered',
          );
        }

        if (
          input.role ===
          null
        ) {
          await personAccess.revokeAccess(
            input.granteeUserId,
            input.subjectUserId,
          );

          return {
            access:
              null,
          };
        }

        const access =
          await personAccess.grantAccess({
            granteeUserId:
              input.granteeUserId,

            subjectUserId:
              input.subjectUserId,

            role:
              input.role,
          });

        return {
          access,
        };
      },
    );
