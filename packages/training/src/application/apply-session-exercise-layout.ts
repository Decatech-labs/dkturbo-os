import type {

  AthleteId,

  DkturboUserId,

  SessionExercise,

  SessionExerciseId,

  TrainingSessionId,

} from '../domain/index.js';

import type {

  SessionExerciseLayoutBlock,

  TrainingUnitOfWork,

} from '../ports/index.js';

import {

  requireAthleteWriteAccess,

} from './require-athlete-write-access.js';

export interface ApplySessionExerciseLayoutInput {

  athleteId:
    AthleteId;

  sessionId:
    TrainingSessionId;

  blocks:
    readonly SessionExerciseLayoutBlock[];

  updatedByUserId:
    DkturboUserId;

}

export const applySessionExerciseLayout =

  async (

    unitOfWork:
      TrainingUnitOfWork,

    input:
      ApplySessionExerciseLayoutInput,

  ): Promise<SessionExercise[]> => {

    const blockIds =

      input.blocks.map(
        block =>
          block.blockId,
      );

    if (
      new Set(
        blockIds,
      ).size !==
      blockIds.length
    ) {

      throw new Error(
        'Session exercise layout contains duplicate block ids',
      );

    }

    const orderedIds =

      input.blocks.flatMap(
        block =>
          block.orderedIds,
      );

    if (
      new Set(
        orderedIds,
      ).size !==
      orderedIds.length
    ) {

      throw new Error(
        'Session exercise layout contains duplicate exercise ids',
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

        const sessionBlocks =

          await sessionStructure
            .listBlocksForSession(

              input.sessionId,

            );

        const currentBlockIds =

          new Set(

            sessionBlocks.map(
              block =>
                block.id,
            ),

          );

        if (
          input.blocks.length !==
          sessionBlocks.length ||

          !input.blocks.every(
            block =>
              currentBlockIds.has(
                block.blockId,
              ),
          )
        ) {

          throw new Error(
            'Session exercise layout must contain every block exactly once',
          );

        }

        const currentExercises =

          (
            await Promise.all(

              sessionBlocks.map(
                block =>
                  sessionStructure
                    .listExercisesForBlock(
                      block.id,
                    ),
              ),

            )
          ).flat();

        const currentExerciseIds =

          new Set(

            currentExercises.map(
              exercise =>
                exercise.id,
            ),

          );

        if (
          orderedIds.length !==
          currentExercises.length ||

          !orderedIds.every(
            id =>
              currentExerciseIds.has(
                id as SessionExerciseId,
              ),
          )
        ) {

          throw new Error(
            'Session exercise layout must contain every exercise exactly once',
          );

        }

        return sessionStructure
          .applySessionExerciseLayout(

            input.sessionId,

            input.athleteId,

            input.blocks,

          );

      },

    );

  };
