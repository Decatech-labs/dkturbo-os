import type {
  HttpRouteRegistrationContext,
} from '@dkturbo/control-plane';

import {
  AthleteReadAccessDeniedError,
  getSessionDetail,
  type AthleteId,
  type DkturboUserId,
  type Training,
  type TrainingSessionId,
} from '@dkturbo/training';

export interface RegisterTrainingRoutesOptions {
  http:
    HttpRouteRegistrationContext;

  training:
    Training;
}

interface TrainingSessionParams {
  athleteId:
    string;

  sessionId:
    string;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parseTrainingSessionParams =
  (
    value:
      unknown,
  ): TrainingSessionParams | null => {

    if (
      typeof value !==
      'object' ||
      value ===
      null
    ) {
      return null;
    }

    const candidate =
      value as
        Record<
          string,
          unknown
        >;

    const athleteId =
      candidate.athleteId;

    const sessionId =
      candidate.sessionId;

    if (
      typeof athleteId !==
        'string' ||
      typeof sessionId !==
        'string' ||
      !uuidPattern.test(
        athleteId,
      ) ||
      !uuidPattern.test(
        sessionId,
      )
    ) {
      return null;
    }

    return {
      athleteId,
      sessionId,
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

        /*
         * AccessPermission already guarantees
         * a user actor, but keep the domain
         * boundary explicit here.
         */
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
          parseTrainingSessionParams(
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
          const detail =
            await getSessionDetail(
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

          return detail;
        } catch (error) {

          /*
           * The platform permission only grants
           * access to the Training application.
           *
           * Athlete privacy is enforced separately.
           */
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
           * Do not reveal whether a session exists
           * under another athlete.
           */
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
