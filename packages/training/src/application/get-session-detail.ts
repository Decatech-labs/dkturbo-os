import type {
  AthleteAccessRole,
  AthleteId,
  DkturboUserId,
  ExerciseCatalogItem,
  PerformanceEntry,
  SessionBlock,
  SessionExercise,
  TrainingSession,
  TrainingSessionId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteReadAccess,
} from './require-athlete-read-access.js';

export interface SessionDetailExercise {
  sessionExercise:
    SessionExercise;

  catalogItem:
    ExerciseCatalogItem;

  performanceEntries:
    PerformanceEntry[];
}

export interface SessionDetailBlock {
  block:
    SessionBlock;

  exercises:
    SessionDetailExercise[];
}

export interface SessionDetail {
  session:
    TrainingSession;

  accessRole:
    AthleteAccessRole;

  canWrite:
    boolean;

  blocks:
    SessionDetailBlock[];
}

export interface GetSessionDetailInput {
  athleteId:
    AthleteId;

  sessionId:
    TrainingSessionId;

  userId:
    DkturboUserId;
}

export const getSessionDetail =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      GetSessionDetailInput,
  ): Promise<SessionDetail> =>
    unitOfWork.execute(
      async ({
        athletes,
        sessions,
        sessionStructure,
      }) => {

        const access =
          await requireAthleteReadAccess(
            athletes,
            input.athleteId,
            input.userId,
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

        const blocks =
          await sessionStructure
            .listBlocksForSession(
              session.id,
            );

        const detailedBlocks:
          SessionDetailBlock[] = [];

        for (
          const block
          of blocks
        ) {

          /*
           * Defense in depth.
           *
           * The database already protects this relationship,
           * but a read model should never trust an inconsistent
           * repository result.
           */
          if (
            block.athleteId !==
            input.athleteId
          ) {
            throw new Error(
              'Session block does not belong to athlete',
            );
          }

          const sessionExercises =
            await sessionStructure
              .listExercisesForBlock(
                block.id,
              );

          const detailedExercises:
            SessionDetailExercise[] = [];

          for (
            const sessionExercise
            of sessionExercises
          ) {

            if (
              sessionExercise.athleteId !==
              input.athleteId
            ) {
              throw new Error(
                'Session exercise does not belong to athlete',
              );
            }

            if (
              sessionExercise.sessionId !==
              session.id
            ) {
              throw new Error(
                'Session exercise does not belong to session',
              );
            }

            const catalogItem =
              await sessionStructure
                .findExerciseById(
                  sessionExercise.exerciseId,
                );

            if (!catalogItem) {
              throw new Error(
                'Exercise catalog item not found',
              );
            }

            const performanceEntries =
              await sessionStructure
                .listPerformanceEntries(
                  sessionExercise.id,
                );

            for (
              const performanceEntry
              of performanceEntries
            ) {
              if (
                performanceEntry.athleteId !==
                input.athleteId
              ) {
                throw new Error(
                  'Performance entry does not belong to athlete',
                );
              }
            }

            detailedExercises.push({
              sessionExercise,
              catalogItem,
              performanceEntries,
            });
          }

          detailedBlocks.push({
            block,
            exercises:
              detailedExercises,
          });
        }

        return {
          session,

          accessRole:
            access.role,

          canWrite:
            access.role ===
              'SELF' ||
            access.role ===
              'COACH',

          blocks:
            detailedBlocks,
        };
      },
    );
