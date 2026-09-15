import type {

  AthleteId,

  DkturboUserId,

  SessionBlockId,

} from '../domain/index.js';

import type {

  TrainingUnitOfWork,

} from '../ports/index.js';

import {

  requireAthleteWriteAccess,

} from './require-athlete-write-access.js';

export interface DeleteSessionBlockInput {

  athleteId:
    AthleteId;

  blockId:
    SessionBlockId;

  deletedByUserId:
    DkturboUserId;

}

export const deleteSessionBlock =

  async (

    unitOfWork:
      TrainingUnitOfWork,

    input:
      DeleteSessionBlockInput,

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

        const block =

          await sessionStructure
            .findBlockById(

              input.blockId,

            );

        if (!block) {

          throw new Error(
            'Session block not found',
          );

        }

        if (
          block.athleteId !==
          input.athleteId
        ) {

          throw new Error(
            'Session block does not belong to athlete',
          );

        }

        const deleted =

          await sessionStructure
            .deleteBlock(

              input.blockId,

              input.athleteId,

            );

        if (!deleted) {

          throw new Error(
            'Session block not found',
          );

        }

      },

    );

  };
