import type {
  AthleteAccess,
  AthleteAccessRole,
  AthleteId,
  DkturboUserId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

export interface SetAthleteAccessAdministrationInput {
  athleteId:
    AthleteId;

  userId:
    DkturboUserId;

  role:
    AthleteAccessRole | null;
}

export interface SetAthleteAccessAdministrationResult {
  access:
    AthleteAccess | null;
}

export const setAthleteAccessAdministration =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      SetAthleteAccessAdministrationInput,
  ): Promise<
    SetAthleteAccessAdministrationResult
  > =>
    unitOfWork.execute(
      async ({
        athletes,
      }) => {

        const athlete =
          await athletes.findById(
            input.athleteId,
          );

        if (!athlete) {
          throw new Error(
            'Training athlete not found',
          );
        }

        if (
          input.role ===
          null
        ) {

          await athletes.revokeAccess(
            input.athleteId,
            input.userId,
          );

          return {
            access:
              null,
          };
        }

        const access =
          await athletes.grantAccess({
            athleteId:
              input.athleteId,

            userId:
              input.userId,

            role:
              input.role,
          });

        return {
          access,
        };
      },
    );
