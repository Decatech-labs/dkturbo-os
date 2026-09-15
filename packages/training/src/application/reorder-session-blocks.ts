import type {

  AthleteId,

  DkturboUserId,

  SessionBlock,

  SessionBlockId,

  TrainingSessionId,

} from '../domain/index.js';

import type {

  TrainingUnitOfWork,

} from '../ports/index.js';

import {

  requireAthleteWriteAccess,

} from './require-athlete-write-access.js';

export interface ReorderSessionBlocksInput {

  athleteId:
    AthleteId;

  sessionId:
    TrainingSessionId;

  orderedIds:
    readonly SessionBlockId[];

  updatedByUserId:
    DkturboUserId;

}

export const reorderSessionBlocks =

  async (

    unitOfWork:
      TrainingUnitOfWork,

    input:
      ReorderSessionBlocksInput,

  ): Promise<SessionBlock[]> => {

    const uniqueIds =

      new Set(
        input.orderedIds,
      );

    if (
      uniqueIds.size !==
      input.orderedIds.length
    ) {

      throw new Error(
        'Session block order contains duplicate ids',
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

          input.updatedByUserId,

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

        const currentBlocks =

          await sessionStructure
            .listBlocksForSession(

              input.sessionId,

            );

        if (
          currentBlocks.length !==
          input.orderedIds.length
        ) {

          throw new Error(
            'Session block order must contain every block exactly once',
          );

        }

        const currentIds =

          new Set(

            currentBlocks.map(
              block =>
                block.id,
            ),

          );

        if (

          !input.orderedIds.every(
            id =>
              currentIds.has(
                id,
              ),
          )

        ) {

          throw new Error(
            'Session block order must contain every block exactly once',
          );

        }

        return sessionStructure
          .reorderBlocks(

            input.sessionId,

            input.athleteId,

            input.orderedIds,

          );

      },

    );

  };
