import type {
  AthleteId,
  DkturboUserId,
  TrainingWeek,
  TrainingWeekId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

export interface UpdateWeekInput {
  athleteId:
    AthleteId;

  weekId:
    TrainingWeekId;

  title:
    string | null;

  notes:
    string | null;

  userId:
    DkturboUserId;
}

export const updateWeek =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      UpdateWeekInput,
  ): Promise<TrainingWeek> =>
    unitOfWork.execute(
      async ({
        athletes,
        weeks,
      }) => {
        await requireAthleteWriteAccess(
          athletes,
          input.athleteId,
          input.userId,
        );

        const existing =
          await weeks.findWeekById(
            input.weekId,
          );

        if (!existing) {
          throw new Error(
            'Training week not found',
          );
        }

        if (
          existing.athleteId !==
          input.athleteId
        ) {
          throw new Error(
            'Training week does not belong to athlete',
          );
        }

        const updated =
          await weeks.updateWeek({
            weekId:
              input.weekId,

            athleteId:
              input.athleteId,

            title:
              input.title,

            notes:
              input.notes,
          });

        if (!updated) {
          throw new Error(
            'Training week not found',
          );
        }

        return updated;
      },
    );
