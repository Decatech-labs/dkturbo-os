import type {
  Athlete,
  DkturboUserId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

export interface CreateAthleteProfileInput {
  userId:
    DkturboUserId;

  displayName:
    string;
}

export interface CreateAthleteProfileResult {
  athlete:
    Athlete;
}

export const createAthleteProfile =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      CreateAthleteProfileInput,
  ): Promise<
    CreateAthleteProfileResult
  > => {

    const displayName =
      input.displayName.trim();

    if (!displayName) {
      throw new Error(
        'Athlete display name is required',
      );
    }

    return unitOfWork.execute(
      async ({
        athletes,
      }) => {

        const athlete =
          await athletes.create({
            displayName,
          });

        await athletes.grantAccess({
          athleteId:
            athlete.id,

          userId:
            input.userId,

          role:
            'SELF',
        });

        return {
          athlete,
        };
      },
    );
  };
