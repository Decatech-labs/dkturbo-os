import type {
  AthleteId,
  DkturboUserId,
} from '../domain/index.js';

import type {
  AthleteRepository,
} from '../ports/index.js';

export class AthleteAccessDeniedError
extends Error {

  public constructor() {
    super(
      'User does not have write access to athlete',
    );

    this.name =
      'AthleteAccessDeniedError';
  }
}

export const requireAthleteWriteAccess =
  async (
    repository:
      AthleteRepository,

    athleteId:
      AthleteId,

    userId:
      DkturboUserId,
  ): Promise<void> => {

    const access =
      await repository.findAccess(
        athleteId,
        userId,
      );

    if (
      !access ||
      (
        access.role !== 'SELF' &&
        access.role !== 'COACH'
      )
    ) {
      throw new AthleteAccessDeniedError();
    }
  };
