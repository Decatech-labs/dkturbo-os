import type {

  AthleteId,

  DkturboUserId,

  SessionBlock,

  SessionBlockId,

} from '../domain/index.js';

import type {

  TrainingUnitOfWork,

} from '../ports/index.js';

import {

  requireAthleteWriteAccess,

} from './require-athlete-write-access.js';

export interface UpdateSessionBlockInput {

  athleteId:
    AthleteId;

  blockId:
    SessionBlockId;

  title:
    string;

  notes:
    string | null;

  updatedByUserId:
    DkturboUserId;

}

export const updateSessionBlock =

  async (

    unitOfWork:
      TrainingUnitOfWork,

    input:
      UpdateSessionBlockInput,

  ): Promise<SessionBlock> => {

    const title =
      input.title.trim();

    if (!title) {

      throw new Error(
        'Session block title is required',
      );

    }

    const notes =

      input.notes?.trim() ||
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

        return sessionStructure
          .updateBlock({

            blockId:
              input.blockId,

            athleteId:
              input.athleteId,

            title,

            notes,

          });

      },

    );

  };
