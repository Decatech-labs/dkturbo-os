import type {
  AthleteAccessRole,
  AthleteId,
  DkturboUserId,
  TrainingDay,
  TrainingSession,
  TrainingWeek,
  TrainingWeekId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

import {
  requireAthleteReadAccess,
} from './require-athlete-read-access.js';

export interface WeekDetailDay {
  day:
    TrainingDay;

  sessions:
    TrainingSession[];
}

export interface WeekDetail {
  week:
    TrainingWeek;

  accessRole:
    AthleteAccessRole;

  canWrite:
    boolean;

  days:
    WeekDetailDay[];
}

export interface GetWeekDetailInput {
  athleteId:
    AthleteId;

  weekId:
    TrainingWeekId;

  userId:
    DkturboUserId;
}

export const getWeekDetail =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      GetWeekDetailInput,
  ): Promise<WeekDetail> =>
    unitOfWork.execute(
      async ({
        athletes,
        weeks,
        sessions,
      }) => {

        const access =
          await requireAthleteReadAccess(
            athletes,
            input.athleteId,
            input.userId,
          );

        const week =
          await weeks.findWeekById(
            input.weekId,
          );

        if (!week) {
          throw new Error(
            'Training week not found',
          );
        }

        if (
          week.athleteId !==
          input.athleteId
        ) {
          throw new Error(
            'Training week does not belong to athlete',
          );
        }

        const days =
          await weeks.listDaysForWeek(
            week.id,
          );

        const detailedDays:
          WeekDetailDay[] = [];

        for (
          const day
          of days
        ) {

          if (
            day.weekId !==
            week.id
          ) {
            throw new Error(
              'Training day does not belong to week',
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

          const daySessions =
            await sessions.listForDay(
              day.id,
            );

          for (
            const session
            of daySessions
          ) {

            if (
              session.dayId !==
              day.id
            ) {
              throw new Error(
                'Training session does not belong to day',
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
          }

          detailedDays.push({
            day,
            sessions:
              daySessions,
          });
        }

        return {
          week,

          accessRole:
            access.role,

          canWrite:
            access.role ===
              'SELF' ||
            access.role ===
              'COACH',

          days:
            detailedDays,
        };
      },
    );
