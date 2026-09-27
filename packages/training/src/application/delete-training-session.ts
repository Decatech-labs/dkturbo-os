import type {
  AthleteId,
  DkturboUserId,
  TrainingSessionId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

export interface DeleteTrainingSessionInput {
  athleteId:
    AthleteId;

  sessionId:
    TrainingSessionId;

  deletedByUserId:
    DkturboUserId;
}

export const deleteTrainingSession =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      DeleteTrainingSessionInput,
  ): Promise<void> => {

    return unitOfWork.execute(
      async ({
        athletes,
        sessions,
      }) => {

        await requireAthleteWriteAccess(
          athletes,
          input.athleteId,
          input.deletedByUserId,
        );

        const session =
          await sessions.findById(
            input.sessionId,
          );

        if (!session) {
          throw new Error(
            'Training session not found',
          );
        }

        if (
          session.athleteId !==
          input.athleteId
        ) {
          throw new Error(
            'Training session does not belong to athlete',
          );
        }

        const deleted =
          await sessions.delete(
            input.sessionId,
            input.athleteId,
          );

        if (!deleted) {
          throw new Error(
            'Training session not found',
          );
        }

      },
    );
  };
