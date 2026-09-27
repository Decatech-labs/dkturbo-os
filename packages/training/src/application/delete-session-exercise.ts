import type {

  AthleteId,

  DkturboUserId,

  SessionExerciseId,

} from '../domain/index.js';

import type {

  TrainingUnitOfWork,

} from '../ports/index.js';

import {

  requireAthleteWriteAccess,

} from './require-athlete-write-access.js';

export interface DeleteSessionExerciseInput {

  athleteId:
    AthleteId;

  sessionExerciseId:
    SessionExerciseId;

  deletedByUserId:
    DkturboUserId;

}

export const deleteSessionExercise =

  async (

    unitOfWork:
      TrainingUnitOfWork,

    input:
      DeleteSessionExerciseInput,

  ): Promise<void> => {

    return unitOfWork.execute(

      async ({

        athletes,

        sessionStructure,

      }) => {

        await requireAthleteWriteAccess(

          athletes,

          input.athleteId,

          input.deletedByUserId,

        );

        const exercise =

          await sessionStructure
            .findSessionExerciseById(

              input.sessionExerciseId,

            );

        if (!exercise) {

          throw new Error(
            'Session exercise not found',
          );

        }

        if (
          exercise.athleteId !==
          input.athleteId
        ) {

          throw new Error(
            'Session exercise does not belong to athlete',
          );

        }

        const deleted =

          await sessionStructure
            .deleteSessionExercise(

              input.sessionExerciseId,

              input.athleteId,

            );

        if (!deleted) {

          throw new Error(
            'Session exercise not found',
          );

        }

      },

    );

  };
