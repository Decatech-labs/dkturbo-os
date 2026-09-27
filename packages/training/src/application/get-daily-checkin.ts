import type {
  AthleteId,
  DailyCheckin,
  DkturboUserId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteReadAccess,
} from './require-athlete-read-access.js';

export interface GetDailyCheckinInput {
  athleteId:
    AthleteId;

  userId:
    DkturboUserId;

  date:
    string;
}

export const getDailyCheckin =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      GetDailyCheckinInput,
  ): Promise<DailyCheckin | null> =>
    unitOfWork.execute(
      async ({
        athletes,
        dailyCheckins,
      }) => {

        await requireAthleteReadAccess(
          athletes,
          input.athleteId,
          input.userId,
        );

        return dailyCheckins
          .findByAthleteAndDate(
            input.athleteId,
            input.date,
          );
      },
    );
