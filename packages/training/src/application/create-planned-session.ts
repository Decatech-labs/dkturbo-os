import type {
  AthleteId,
  DkturboUserId,
  TrainingDayId,
  TrainingSession,
  TrainingSessionType,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

export interface CreatePlannedSessionInput {
  athleteId:
    AthleteId;

  dayId:
    TrainingDayId;

  type:
    TrainingSessionType;

  title:
    string;

  plannedStartTime?:
    string | null;

  plannedDurationMinutes?:
    number | null;

  plannedNotes?:
    string | null;

  plannedRpe?:
    number | null;

  createdByUserId:
    DkturboUserId;
}

const TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createPlannedSession =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      CreatePlannedSessionInput,
  ): Promise<TrainingSession> => {

    const title =
      input.title.trim();

    if (!title) {
      throw new Error(
        'Session title is required',
      );
    }

    const plannedStartTime =
      input.plannedStartTime ??
      null;

    if (
      plannedStartTime !== null &&
      !TIME_PATTERN.test(
        plannedStartTime,
      )
    ) {
      throw new Error(
        'plannedStartTime must use HH:MM format',
      );
    }

    const plannedDurationMinutes =
      input.plannedDurationMinutes ??
      null;

    if (
      plannedDurationMinutes !== null &&
      (
        !Number.isInteger(
          plannedDurationMinutes,
        ) ||
        plannedDurationMinutes < 0
      )
    ) {
      throw new Error(
        'plannedDurationMinutes must be a non-negative integer',
      );
    }

    const plannedRpe =
      input.plannedRpe ??
      null;

    if (
      plannedRpe !== null &&
      (
        !Number.isFinite(
          plannedRpe,
        ) ||
        plannedRpe < 0 ||
        plannedRpe > 10
      )
    ) {
      throw new Error(
        'plannedRpe must be between 0 and 10',
      );
    }

    return unitOfWork.execute(
      async ({
        athletes,
        weeks,
        sessions,
      }) => {

        await requireAthleteWriteAccess(
          athletes,
          input.athleteId,
          input.createdByUserId,
        );

        const day =
          await weeks.findDayById(
            input.dayId,
          );

        if (!day) {
          throw new Error(
            'Training day not found',
          );
        }

        if (
          day.athleteId !==
          input.athleteId
        ) {
          throw new Error(
            'Training day does not belong to athlete',
          );
        }

        return sessions.createPlanned({
          dayId:
            input.dayId,

          athleteId:
            input.athleteId,

          type:
            input.type,

          title,

          plannedStartTime,

          plannedDurationMinutes,

          plannedNotes:
            input.plannedNotes ??
            null,

          plannedRpe,

          createdByUserId:
            input.createdByUserId,
        });
      },
    );
  };
