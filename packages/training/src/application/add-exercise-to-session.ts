import type {
  AthleteId,
  DkturboUserId,
  ExerciseCatalogId,
  ExerciseCatalogItem,
  ExerciseMetricProfile,
  SessionBlockId,
  SessionExercise,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

interface AddExistingExercise {
  existingExerciseId:
    ExerciseCatalogId;

  manualExercise?:
    never;
}

interface AddManualExercise {
  existingExerciseId?:
    never;

  manualExercise: {
    name:
      string;

    category?:
      string | null;

    sport?:
      string | null;

    metricProfile:
      ExerciseMetricProfile;
  };
}

export type AddExerciseSelection =
  | AddExistingExercise
  | AddManualExercise;

export interface AddExerciseToSessionBaseInput {
  athleteId:
    AthleteId;

  blockId:
    SessionBlockId;

  position:
    number;

  plannedNotes?:
    string | null;

  actualNotes?:
    string | null;

  createdByUserId:
    DkturboUserId;
}

export type AddExerciseToSessionInput =
  AddExerciseToSessionBaseInput &
  AddExerciseSelection;

export interface AddExerciseToSessionResult {
  exercise:
    ExerciseCatalogItem;

  sessionExercise:
    SessionExercise;

  createdExercise:
    boolean;
}

export const addExerciseToSession =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      AddExerciseToSessionInput,
  ): Promise<AddExerciseToSessionResult> => {

    if (
      !Number.isInteger(
        input.position,
      ) ||
      input.position < 0
    ) {
      throw new Error(
        'Exercise position must be a non-negative integer',
      );
    }

    if (
      input.manualExercise
    ) {

      const name =
        input.manualExercise
          .name
          .trim();

      if (!name) {
        throw new Error(
          'Exercise name is required',
        );
      }
    }

    return unitOfWork.execute(
      async ({
        athletes,
        sessionStructure,
      }) => {

        await requireAthleteWriteAccess(
          athletes,
          input.athleteId,
          input.createdByUserId,
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

        let exercise:
          ExerciseCatalogItem;

        let createdExercise =
          false;

        if (
          input.manualExercise
        ) {

          exercise =
            await sessionStructure
              .createCustomExercise({
                name:
                  input.manualExercise
                    .name
                    .trim(),

                category:
                  input.manualExercise
                    .category ??
                  null,

                sport:
                  input.manualExercise
                    .sport ??
                  null,

                metricProfile:
                  input.manualExercise
                    .metricProfile,

                createdByUserId:
                  input.createdByUserId,
              });

          createdExercise =
            true;

        } else {

          const existingExercise =
            await sessionStructure
              .findExerciseById(
                input.existingExerciseId,
              );

          if (!existingExercise) {
            throw new Error(
              'Exercise not found',
            );
          }

          exercise =
            existingExercise;
        }

        const sessionExercise =
          await sessionStructure
            .addExercise({
              blockId:
                block.id,

              sessionId:
                block.sessionId,

              athleteId:
                input.athleteId,

              exerciseId:
                exercise.id,

              position:
                input.position,

              plannedNotes:
                input.plannedNotes ??
                null,

              actualNotes:
                input.actualNotes ??
                null,
            });

        return {
          exercise,
          sessionExercise,
          createdExercise,
        };
      },
    );
  };
