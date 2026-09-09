import type {
  AthleteAccess,
  AthleteId,
  DkturboUserId,
} from '../domain/index.js';

import type {
  AthleteRepository,
} from '../ports/index.js';

export class AthleteReadAccessDeniedError
extends Error {

  public constructor() {
    super(
      'User does not have read access to athlete',
    );

    this.name =
      'AthleteReadAccessDeniedError';
  }
}

export const requireAthleteReadAccess =
  async (
    athletes:
      AthleteRepository,

    athleteId:
      AthleteId,

    userId:
      DkturboUserId,
  ): Promise<AthleteAccess> => {

    const access =
      await athletes.findAccess(
        athleteId,
        userId,
      );

    if (!access) {
      throw new AthleteReadAccessDeniedError();
    }

    return access;
  };
