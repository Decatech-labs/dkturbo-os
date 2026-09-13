import type {
  HttpRouteRegistrationContext,
} from '@dkturbo/control-plane';

import {
  AthleteAccessDeniedError,
  AthleteReadAccessDeniedError,
  createPlannedSession,
  createWeek,
  getSessionDetail,
  getWeekDetail,
  listAccessibleAthletes,
  listWeeksForAthlete,
  updateWeek,
  type AthleteId,
  type DkturboUserId,
  type Training,
  type TrainingDayId,
  type TrainingSessionId,
  type TrainingSessionType,
  type TrainingWeekId,
} from '@dkturbo/training';

export interface RegisterTrainingRoutesOptions {
  http:
    HttpRouteRegistrationContext;

  training:
    Training;
}

interface DayParams {
  athleteId:
    string;

  dayId:
    string;
}

interface CreatePlannedSessionBody {
  type:
    TrainingSessionType;

  title:
    string;

  plannedStartTime:
    string | null;

  plannedDurationMinutes:
    number | null;

  plannedNotes:
    string | null;

  plannedRpe:
    number | null;
}

interface AthleteParams {
  athleteId:
    string;
}

interface WeekParams {
  athleteId:
    string;

  weekId:
    string;
}

interface SessionParams {
  athleteId:
    string;

  sessionId:
    string;
}

interface CreateWeekBody {
  weekStart:
    string;

  title:
    string | null;

  notes:
    string | null;
}

interface UpdateWeekBody {
  title:
    string | null;

  notes:
    string | null;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid =
  (
    value:
      unknown,
  ): value is string =>
    typeof value ===
      'string' &&
    uuidPattern.test(
      value,
    );

const parseUpdateWeekBody =
  (
    value:
      unknown,
  ): UpdateWeekBody | null => {
    if (
      typeof value !==
        'object' ||
      value === null
    ) {
      return null;
    }

    const candidate =
      value as Record<
        string,
        unknown
      >;

    if (
      candidate.title !==
        undefined &&
      candidate.title !==
        null &&
      typeof candidate.title !==
        'string'
    ) {
      return null;
    }

    if (
      candidate.notes !==
        undefined &&
      candidate.notes !==
        null &&
      typeof candidate.notes !==
        'string'
    ) {
      return null;
    }

    return {
      title:
        candidate.title ===
          undefined
          ? null
          : candidate.title,

      notes:
        candidate.notes ===
          undefined
          ? null
          : candidate.notes,
    };
  };

const parseAthleteParams =
  (
    value:
      unknown,
  ): AthleteParams | null => {

    if (
      typeof value !==
        'object' ||
      value === null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      !isUuid(
        candidate.athleteId,
      )
    ) {
      return null;
    }

    return {
      athleteId:
        candidate.athleteId,
    };
  };

const parseWeekParams =
  (
    value:
      unknown,
  ): WeekParams | null => {

    if (
      typeof value !==
        'object' ||
      value === null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      !isUuid(
        candidate.athleteId,
      ) ||
      !isUuid(
        candidate.weekId,
      )
    ) {
      return null;
    }

    return {
      athleteId:
        candidate.athleteId,

      weekId:
        candidate.weekId,
    };
  };

const parseSessionParams =
  (
    value:
      unknown,
  ): SessionParams | null => {

    if (
      typeof value !==
        'object' ||
      value === null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    if (
      !isUuid(
        candidate.athleteId,
      ) ||
      !isUuid(
        candidate.sessionId,
      )
    ) {
      return null;
    }

    return {
      athleteId:
        candidate.athleteId,

      sessionId:
        candidate.sessionId,
    };
  };

const parseDayParams =
  (
    value:
      unknown,
  ): DayParams | null => {

    if (
      typeof value !==
        'object' ||
      value === null
    ) {
      return null;
    }

    const candidate =
      value as Record<
        string,
        unknown
      >;

    if (
      !isUuid(
        candidate.athleteId,
      ) ||
      !isUuid(
        candidate.dayId,
      )
    ) {
      return null;
    }

    return {
      athleteId:
        candidate.athleteId,

      dayId:
        candidate.dayId,
    };
  };

const trainingSessionTypes =
  new Set<
    TrainingSessionType
  >([
    'STRENGTH',
    'RUNNING',
    'SWIMMING',
    'CYCLING',
    'POLE_VAULT',
    'JUMPS',
    'THROWS',
    'TECHNIQUE',
    'REHAB',
    'MOBILITY',
    'OTHER',
  ]);

const parseCreatePlannedSessionBody =
  (
    value:
      unknown,
  ): CreatePlannedSessionBody | null => {

    if (
      typeof value !==
        'object' ||
      value === null
    ) {
      return null;
    }

    const candidate =
      value as Record<
        string,
        unknown
      >;

    if (
      typeof candidate.type !==
        'string' ||
      !trainingSessionTypes.has(
        candidate.type as
          TrainingSessionType,
      )
    ) {
      return null;
    }

    if (
      typeof candidate.title !==
        'string'
    ) {
      return null;
    }

    if (
      candidate.plannedStartTime !==
        undefined &&
      candidate.plannedStartTime !==
        null &&
      typeof candidate.plannedStartTime !==
        'string'
    ) {
      return null;
    }

    if (
      candidate.plannedDurationMinutes !==
        undefined &&
      candidate.plannedDurationMinutes !==
        null &&
      typeof candidate.plannedDurationMinutes !==
        'number'
    ) {
      return null;
    }

    if (
      candidate.plannedNotes !==
        undefined &&
      candidate.plannedNotes !==
        null &&
      typeof candidate.plannedNotes !==
        'string'
    ) {
      return null;
    }

    if (
      candidate.plannedRpe !==
        undefined &&
      candidate.plannedRpe !==
        null &&
      typeof candidate.plannedRpe !==
        'number'
    ) {
      return null;
    }

    return {
      type:
        candidate.type as
          TrainingSessionType,

      title:
        candidate.title,

      plannedStartTime:
        candidate.plannedStartTime ===
          undefined
          ? null
          : candidate.plannedStartTime,

      plannedDurationMinutes:
        candidate.plannedDurationMinutes ===
          undefined
          ? null
          : candidate.plannedDurationMinutes,

      plannedNotes:
        candidate.plannedNotes ===
          undefined
          ? null
          : candidate.plannedNotes,

      plannedRpe:
        candidate.plannedRpe ===
          undefined
          ? null
          : candidate.plannedRpe,
    };
  };

const isoDatePattern =
  /^\d{4}-\d{2}-\d{2}$/;

const parseCreateWeekBody =
  (
    value:
      unknown,
  ): CreateWeekBody | null => {

    if (
      typeof value !==
        'object' ||
      value === null
    ) {
      return null;
    }

    const candidate =
      value as Record<
        string,
        unknown
      >;

    if (
      typeof candidate.weekStart !==
        'string' ||
      !isoDatePattern.test(
        candidate.weekStart,
      )
    ) {
      return null;
    }

    if (
      candidate.title !==
        undefined &&
      candidate.title !==
        null &&
      typeof candidate.title !==
        'string'
    ) {
      return null;
    }

    if (
      candidate.notes !==
        undefined &&
      candidate.notes !==
        null &&
      typeof candidate.notes !==
        'string'
    ) {
      return null;
    }

    return {
      weekStart:
        candidate.weekStart,

      title:
        candidate.title === undefined
          ? null
          : candidate.title,

      notes:
        candidate.notes === undefined
          ? null
          : candidate.notes,
    };
  };

export const registerTrainingRoutes =
  ({
    http,
    training,
  }: RegisterTrainingRoutesOptions):
    void => {

    const {
      app,
      requireAccessPermission,
    } = http;

    /*
     * List only athletes for which the
     * authenticated user has explicit
     * Training athlete_access.
     *
     * Owner app-level bypass does not
     * widen this result.
     */
    app.get(
      '/api/training/athletes',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.training.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        return training
          .unitOfWork
          .execute(
            ({
              athletes,
            }) =>
              listAccessibleAthletes(
                athletes,
                actor.id as
                  DkturboUserId,
              ),
          );
      },
    );

    /*
     * List weeks for one explicitly
     * accessible athlete.
     */
    app.get(
      '/api/training/athletes/:athleteId/weeks',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.training.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseAthleteParams(
            request.params,
          );

        if (!params) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          return await listWeeksForAthlete(
            training.unitOfWork,
            {
              athleteId:
                params.athleteId as
                  AthleteId,

              userId:
                actor.id as
                  DkturboUserId,
            },
          );
        } catch (error) {

          if (
            error instanceof
            AthleteReadAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'athlete_access_denied',
              });
          }

          request.log.error(
            error,
            'Failed to list Training weeks',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    app.post(
      '/api/training/athletes/:athleteId/weeks',
      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.training.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseAthleteParams(
            request.params,
          );

        const body =
          parseCreateWeekBody(
            request.body,
          );

        if (
          !params ||
          !body
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {

          const result =
            await createWeek(
              training.unitOfWork,
              {
                athleteId:
                  params.athleteId as
                    AthleteId,

                weekStart:
                  body.weekStart,

                title:
                  body.title,

                notes:
                  body.notes,

                createdByUserId:
                  actor.id as
                    DkturboUserId,
              },
            );

          return reply
            .code(201)
            .send(
              result,
            );

        } catch (error) {

          if (
            error instanceof
            AthleteAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'athlete_access_denied',
              });
          }

          if (
            error instanceof
              Error &&
            (
              error.message ===
                'weekStart must be a valid YYYY-MM-DD date' ||
              error.message ===
                'weekStart must be a Monday'
            )
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_week_start',
              });
          }

          if (
            error instanceof
              Error &&
            error.message ===
              'Training week already exists'
          ) {
            return reply
              .code(409)
              .send({
                error:
                  'training_week_already_exists',
              });
          }

          request.log.error(
            error,
            'Failed to create Training week',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    app.patch(
      '/api/training/athletes/:athleteId/weeks/:weekId',
      async (
        request,
        reply,
      ) => {
        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.training.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseWeekParams(
            request.params,
          );

        const body =
          parseUpdateWeekBody(
            request.body,
          );

        if (
          !params ||
          !body
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          const week =
            await updateWeek(
              training.unitOfWork,
              {
                athleteId:
                  params.athleteId as
                    AthleteId,

                weekId:
                  params.weekId as
                    TrainingWeekId,

                title:
                  body.title,

                notes:
                  body.notes,

                userId:
                  actor.id as
                    DkturboUserId,
              },
            );

          return week;

        } catch (error) {
          if (
            error instanceof
            AthleteAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'athlete_access_denied',
              });
          }

          if (
            error instanceof Error &&
            (
              error.message ===
                'Training week not found' ||
              error.message ===
                'Training week does not belong to athlete'
            )
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'training_week_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to update Training week',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    app.post(
      '/api/training/athletes/:athleteId/days/:dayId/sessions',
      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.training.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseDayParams(
            request.params,
          );

        const body =
          parseCreatePlannedSessionBody(
            request.body,
          );

        if (
          !params ||
          !body
        ) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          const session =
            await createPlannedSession(
              training.unitOfWork,
              {
                athleteId:
                  params.athleteId as
                    AthleteId,

                dayId:
                  params.dayId as
                    TrainingDayId,

                type:
                  body.type,

                title:
                  body.title,

                plannedStartTime:
                  body.plannedStartTime,

                plannedDurationMinutes:
                  body.plannedDurationMinutes,

                plannedNotes:
                  body.plannedNotes,

                plannedRpe:
                  body.plannedRpe,

                createdByUserId:
                  actor.id as
                    DkturboUserId,
              },
            );

          return reply
            .code(201)
            .send(
              session,
            );

        } catch (error) {

          if (
            error instanceof
            AthleteAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'athlete_access_denied',
              });
          }

          if (
            error instanceof
              Error &&
            (
              error.message ===
                'Training day not found' ||
              error.message ===
                'Training day does not belong to athlete'
            )
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'training_day_not_found',
              });
          }

          if (
            error instanceof
              Error &&
            (
              error.message ===
                'Session title is required' ||
              error.message ===
                'plannedStartTime must use HH:MM format' ||
              error.message ===
                'plannedDurationMinutes must be a non-negative integer' ||
              error.message ===
                'plannedRpe must be between 0 and 10'
            )
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_session',
              });
          }

          request.log.error(
            error,
            'Failed to create Training session',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    /*
     * Complete week navigation:
     *
     * week
     *   -> days
     *      -> sessions
     */
    app.get(
      '/api/training/athletes/:athleteId/weeks/:weekId',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.training.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseWeekParams(
            request.params,
          );

        if (!params) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          return await getWeekDetail(
            training.unitOfWork,
            {
              athleteId:
                params.athleteId as
                  AthleteId,

              weekId:
                params.weekId as
                  TrainingWeekId,

              userId:
                actor.id as
                  DkturboUserId,
            },
          );
        } catch (error) {

          if (
            error instanceof
            AthleteReadAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'athlete_access_denied',
              });
          }

          /*
           * Do not disclose whether a week
           * belongs to another athlete.
           */
          if (
            error instanceof
              Error &&
            (
              error.message ===
                'Training week not found' ||
              error.message ===
                'Training week does not belong to athlete'
            )
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'training_week_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to get Training week detail',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );

    /*
     * Complete session aggregate.
     */
    app.get(
      '/api/training/athletes/:athleteId/sessions/:sessionId',

      async (
        request,
        reply,
      ) => {

        const actor =
          await requireAccessPermission(
            request,
            reply,
            'app.training.access',
          );

        if (!actor) {
          return;
        }

        if (
          actor.kind !==
          'user'
        ) {
          return reply
            .code(403)
            .send({
              error:
                'authorization_denied',
            });
        }

        const params =
          parseSessionParams(
            request.params,
          );

        if (!params) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        try {
          return await getSessionDetail(
            training.unitOfWork,
            {
              athleteId:
                params.athleteId as
                  AthleteId,

              sessionId:
                params.sessionId as
                  TrainingSessionId,

              userId:
                actor.id as
                  DkturboUserId,
            },
          );
        } catch (error) {

          if (
            error instanceof
            AthleteReadAccessDeniedError
          ) {
            return reply
              .code(403)
              .send({
                error:
                  'athlete_access_denied',
              });
          }

          if (
            error instanceof
              Error &&
            (
              error.message ===
                'Training session not found' ||
              error.message ===
                'Training session does not belong to athlete'
            )
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'training_session_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to get Training session detail',
          );

          return reply
            .code(500)
            .send({
              error:
                'internal_error',
            });
        }
      },
    );
  };