import type {
  AthleteId,
  DkturboUserId,
  PerformanceEntryId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

export interface DeletePerformanceEntryInput {
  athleteId:
    AthleteId;

  performanceEntryId:
    PerformanceEntryId;

  deletedByUserId:
    DkturboUserId;
}

export const deletePerformanceEntry =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      DeletePerformanceEntryInput,
  ): Promise<void> => {

    await unitOfWork.execute(
      async ({
        athletes,
        sessionStructure,
      }) => {
        await requireAthleteWriteAccess(
          athletes,
          input.athleteId,
          input.deletedByUserId,
        );

        const entry =
          await sessionStructure
            .findPerformanceEntryById(
              input.performanceEntryId,
            );

        if (!entry) {
          throw new Error(
            'Performance entry not found',
          );
        }

        if (
          entry.athleteId !==
          input.athleteId
        ) {
          throw new Error(
            'Performance entry does not belong to athlete',
          );
        }

        const deleted =
          await sessionStructure
            .deletePerformanceEntry(
              input.performanceEntryId,
              input.athleteId,
            );

        if (!deleted) {
          throw new Error(
            'Performance entry not found',
          );
        }
      },
    );
  };
