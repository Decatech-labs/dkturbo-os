import type {
  Athlete,
  DkturboUserId,
} from '../domain/index.js';

import type {
  AthleteRepository,
} from '../ports/index.js';

export const listAccessibleAthletes =
  (
    repository:
      AthleteRepository,

    userId:
      DkturboUserId,
  ): Promise<Athlete[]> =>
    repository.listForUser(
      userId,
    );
