import type {
  AthleteAccessRole,
  AthleteId,
  DkturboUserId,
  TrainingWeek,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteReadAccess,
} from './require-athlete-read-access.js';

export interface ListWeeksForAthleteInput {
  athleteId:
    AthleteId;

  userId:
    DkturboUserId;
}

export interface AccessibleTrainingWeek {
  week:
    TrainingWeek;

  accessRole:
    AthleteAccessRole;

  canWrite:
    boolean;
}

export const listWeeksForAthlete =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      ListWeeksForAthleteInput,
  ): Promise<AccessibleTrainingWeek[]> =>
    unitOfWork.execute(
      async ({
        athletes,
        weeks,
      }) => {

        const access =
          await requireAthleteReadAccess(
            athletes,
            input.athleteId,
            input.userId,
          );

        const athleteWeeks =
          await weeks.listForAthlete(
            input.athleteId,
          );

        /*
         * Defense in depth:
         * the repository query already scopes by athlete.
         */
        for (
          const week
          of athleteWeeks
        ) {
          if (
            week.athleteId !==
            input.athleteId
          ) {
            throw new Error(
              'Training week does not belong to athlete',
            );
          }
        }

        const canWrite =
          access.role ===
            'SELF' ||
          access.role ===
            'COACH';

        return athleteWeeks.map(
          (week) => ({
            week,
            accessRole:
              access.role,
            canWrite,
          }),
        );
      },
    );
