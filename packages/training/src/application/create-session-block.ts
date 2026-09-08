import type {
  AthleteId,
  DkturboUserId,
  SessionBlock,
  TrainingSessionId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

export interface CreateSessionBlockInput {
  athleteId:
    AthleteId;

  sessionId:
    TrainingSessionId;

  position:
    number;

  title:
    string;

  notes?:
    string | null;

  createdByUserId:
    DkturboUserId;
}

export const createSessionBlock =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      CreateSessionBlockInput,
  ): Promise<SessionBlock> => {

    const title =
      input.title.trim();

    if (!title) {
      throw new Error(
        'Session block title is required',
      );
    }

    if (
      !Number.isInteger(
        input.position,
      ) ||
      input.position < 0
    ) {
      throw new Error(
        'Session block position must be a non-negative integer',
      );
    }

    return unitOfWork.execute(
      async ({
        athletes,
        sessions,
        sessionStructure,
      }) => {

        await requireAthleteWriteAccess(
          athletes,
          input.athleteId,
          input.createdByUserId,
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

        return sessionStructure.createBlock({
          sessionId:
            input.sessionId,

          athleteId:
            input.athleteId,

          position:
            input.position,

          title,

          notes:
            input.notes ??
            null,
        });
      },
    );
  };
