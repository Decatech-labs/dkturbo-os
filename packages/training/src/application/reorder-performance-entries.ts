import type {

  AthleteId,

  DkturboUserId,

  PerformanceEntry,

  PerformanceEntryId,

  SessionExerciseId,

} from '../domain/index.js';

import type {

  TrainingUnitOfWork,

} from '../ports/index.js';

import {

  requireAthleteWriteAccess,

} from './require-athlete-write-access.js';

export interface ReorderPerformanceEntriesInput {

  athleteId:
    AthleteId;

  sessionExerciseId:
    SessionExerciseId;

  orderedIds:
    readonly PerformanceEntryId[];

  updatedByUserId:
    DkturboUserId;
}

export const reorderPerformanceEntries =

  async (

    unitOfWork:
      TrainingUnitOfWork,

    input:
      ReorderPerformanceEntriesInput,

  ): Promise<PerformanceEntry[]> => {

    const uniqueIds =
      new Set(
        input.orderedIds,
      );

    if (
      uniqueIds.size !==
      input.orderedIds.length
    ) {
      throw new Error(
        'Performance entry order contains duplicate ids',
      );
    }

    return unitOfWork.execute(

      async ({

        athletes,

        sessionStructure,

      }) => {

        await requireAthleteWriteAccess(

          athletes,

          input.athleteId,

          input.updatedByUserId,

        );

        const sessionExercise =

          await sessionStructure
            .findSessionExerciseById(

              input.sessionExerciseId,

            );

        if (!sessionExercise) {

          throw new Error(
            'Session exercise not found',
          );

        }

        if (
          sessionExercise.athleteId !==
          input.athleteId
        ) {

          throw new Error(
            'Session exercise does not belong to athlete',
          );

        }

        const currentEntries =

          await sessionStructure
            .listPerformanceEntries(

              input.sessionExerciseId,

            );

        if (
          currentEntries.length !==
          input.orderedIds.length
        ) {

          throw new Error(
            'Performance entry order must contain every entry exactly once',
          );

        }

        const currentIds =
          new Set(
            currentEntries.map(
              entry =>
                entry.id,
            ),
          );

        const containsExactlyCurrentEntries =
          input.orderedIds.every(
            id =>
              currentIds.has(
                id,
              ),
          );

        if (
          !containsExactlyCurrentEntries
        ) {

          throw new Error(
            'Performance entry order must contain every entry exactly once',
          );

        }

        return sessionStructure
          .reorderPerformanceEntries(

            input.sessionExerciseId,

            input.athleteId,

            input.orderedIds,

          );

      },

    );

  };
