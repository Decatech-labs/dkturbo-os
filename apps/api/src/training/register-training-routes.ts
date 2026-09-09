import type {
  HttpRouteRegistrationContext,
} from '@dkturbo/control-plane';

import {
  AthleteReadAccessDeniedError,
  getSessionDetail,
  getWeekDetail,
  listAccessibleAthletes,
  listWeeksForAthlete,
  type AthleteId,
  type DkturboUserId,
  type Training,
  type TrainingSessionId,
  type TrainingWeekId,
} from '@dkturbo/training';

export interface RegisterTrainingRoutesOptions {
  http:
    HttpRouteRegistrationContext;

  training:
    Training;
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