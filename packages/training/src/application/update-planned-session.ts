import type {
  AthleteId,
  DkturboUserId,
  TrainingDayId,
  TrainingSession,
  TrainingSessionId,
  TrainingSessionType,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteWriteAccess,
} from './require-athlete-write-access.js';

export interface UpdatePlannedSessionInput {
  athleteId:
    AthleteId;

  sessionId:
    TrainingSessionId;

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

  updatedByUserId:
    DkturboUserId;
}

const TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

export const updatePlannedSession =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      UpdatePlannedSessionInput,
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

        const updated =
          await sessions.updatePlanned({
            sessionId:
              input.sessionId,

            athleteId:
              input.athleteId,

            dayId:
              input.dayId,

            type:
              input.type,

            title,

            plannedStartTime,

            plannedDurationMinutes,

            plannedNotes:
              input.plannedNotes ??
              null,

            plannedRpe,
          });

        if (!updated) {
          throw new Error(
            'Training session not found',
          );
        }

        return updated;
      },
    );
  };
