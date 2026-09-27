import type {

  AthleteId,

  DkturboUserId,

  SessionExercise,

  SessionExerciseId,

} from '../domain/index.js';

import type {

  TrainingUnitOfWork,

} from '../ports/index.js';

import {

  requireAthleteWriteAccess,

} from './require-athlete-write-access.js';

export interface UpdateSessionExercisePlannedInput {

  athleteId:
    AthleteId;

  sessionExerciseId:
    SessionExerciseId;

  plannedNotes:
    string | null;

  updatedByUserId:
    DkturboUserId;

}

export const updateSessionExercisePlanned =

  async (

    unitOfWork:
      TrainingUnitOfWork,

    input:
      UpdateSessionExercisePlannedInput,

  ): Promise<SessionExercise> => {

    const plannedNotes =

      input.plannedNotes
        ?.trim() ||
      null;

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

        return sessionStructure
          .updateSessionExercisePlanned({

            sessionExerciseId:
              input.sessionExerciseId,

            athleteId:
              input.athleteId,

            plannedNotes,

          });

      },

    );

  };
