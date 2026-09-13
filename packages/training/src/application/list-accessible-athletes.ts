import type {
  Athlete,
  AthleteAccessRole,
  DkturboUserId,
} from '../domain/index.js';

import type {
  AthleteRepository,
} from '../ports/index.js';

export interface AccessibleAthlete {
  athlete:
    Athlete;

  accessRole:
    AthleteAccessRole;

  canWrite:
    boolean;
}

export const listAccessibleAthletes =
  async (
    repository:
      AthleteRepository,

    userId:
      DkturboUserId,
  ): Promise<AccessibleAthlete[]> => {
    const accessible =
      await repository.listForUser(
        userId,
      );

    return accessible.map(
      ({
        athlete,
        access,
      }) => ({
        athlete,

        accessRole:
          access.role,

        canWrite:
          access.role ===
            'SELF' ||
          access.role ===
            'COACH',
      }),
    );
  };