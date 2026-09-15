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
  createSessionBlock,
  updateSessionBlock,
  deleteSessionBlock,
  reorderSessionBlocks,
  addExerciseToSession,
  addPerformanceEntry,
  updatePerformanceEntryPlanned,
  deletePerformanceEntry,
  reorderPerformanceEntries,
  type AthleteId,
  type DkturboUserId,
  type Training,
  type TrainingDayId,
  type TrainingSessionId,
  type TrainingSessionType,
  type TrainingWeekId,
  type ExerciseCatalogId,
  type ExerciseMetricProfile,
  type SessionBlockId,
  type SessionExerciseId,
  type PerformanceEntryId,
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

interface CreateSessionBlockBody {

  position:
    number;

  title:
    string;

  notes:
    string | null;

}

interface UpdateSessionBlockBody {

  title:
    string;

  notes:
    string | null;

}

interface ReorderSessionBlocksBody {

  orderedIds:
    string[];

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

interface BlockParams {
  athleteId:
    string;

  blockId:
    string;
}

interface SessionExerciseParams {
  athleteId:
    string;

  sessionExerciseId:
    string;
}

interface PerformanceEntryParams {
  athleteId:
    string;

  performanceEntryId:
    string;
}

interface ExerciseSearchQuery {
  query?:
    string;

  metricProfile?:
    ExerciseMetricProfile;

  origin?:
    'SYSTEM' | 'CUSTOM';

  sport?:
    string;
}

interface AddExistingExerciseBody {
  position:
    number;

  existingExerciseId:
    string;

  manualExercise?:
    never;

  plannedNotes:
    string | null;
}

interface AddManualExerciseBody {
  position:
    number;

  existingExerciseId?:
    never;

  manualExercise: {
    name:
      string;

    category:
      string | null;

    sport:
      string | null;

    metricProfile:
      ExerciseMetricProfile;
  };

  plannedNotes:
    string | null;
}

interface CreatePerformanceEntryBody {
  position:
    number;

  planned: {
    reps:
      number | null;

    loadKg:
      number | null;

    distanceM:
      number | null;

    durationMs:
      number | null;

    resultM:
      number | null;

    heightM:
      number | null;

    rpe:
      number | null;

    rir:
      number | null;

    restSeconds:
      number | null;

    notes:
      string | null;
  };
}

interface ReorderPerformanceEntriesBody {
  orderedIds:
    string[];
}

interface UpdatePerformanceEntryBody {
  planned: {
    reps:
      number | null;

    loadKg:
      number | null;

    distanceM:
      number | null;

    durationMs:
      number | null;

    resultM:
      number | null;

    heightM:
      number | null;

    rpe:
      number | null;

    rir:
      number | null;

    restSeconds:
      number | null;

    notes:
      string | null;
  };
}

type AddExerciseBody =
  | AddExistingExerciseBody
  | AddManualExerciseBody;

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

const parseUpdateSessionBlockBody =

  (

    value:
      unknown,

  ): UpdateSessionBlockBody | null => {

    if (

      typeof value !==
        'object' ||

      value ===
        null

    ) {

      return null;

    }

    const candidate =

      value as Record<
        string,
        unknown
      >;

    if (

      typeof candidate.title !==
        'string'

    ) {

      return null;

    }

    if (

      candidate.notes !==
        null &&

      typeof candidate.notes !==
        'string'

    ) {

      return null;

    }

    return {

      title:
        candidate.title,

      notes:
        candidate.notes,

    };

  };

const parseReorderSessionBlocksBody =

  (

    value:
      unknown,

  ): ReorderSessionBlocksBody | null => {

    if (

      typeof value !==
        'object' ||

      value ===
        null

    ) {

      return null;

    }

    const candidate =

      value as Record<
        string,
        unknown
      >;

    if (

      !Array.isArray(
        candidate.orderedIds,
      )

    ) {

      return null;

    }

    if (

      !candidate.orderedIds.every(
        isUuid,
      )

    ) {

      return null;

    }

    return {

      orderedIds:
        candidate.orderedIds,

    };

  };

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

const exerciseMetricProfiles =
  new Set<ExerciseMetricProfile>([
    'STRENGTH',
    'INTERVAL',
    'CONTINUOUS',
    'ATTEMPT_DISTANCE',
    'ATTEMPT_HEIGHT',
    'REHAB',
    'GENERIC',
  ]);

const parseBlockParams =
  (
    value:
      unknown,
  ): BlockParams | null => {
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
      typeof candidate.athleteId !==
        'string' ||
      typeof candidate.blockId !==
        'string' ||
      !uuidPattern.test(
        candidate.athleteId,
      ) ||
      !uuidPattern.test(
        candidate.blockId,
      )
    ) {
      return null;
    }

    return {
      athleteId:
        candidate.athleteId,

      blockId:
        candidate.blockId,
    };
  };

const isNullableNumber =
  (
    value:
      unknown,
  ): value is number | null =>
    value === null ||
    (
      typeof value ===
        'number' &&
      Number.isFinite(
        value,
      )
    );

const parseCreatePerformanceEntryBody =
  (
    value:
      unknown,
  ): CreatePerformanceEntryBody | null => {
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
      typeof candidate.position !==
        'number' ||
      !Number.isInteger(
        candidate.position,
      ) ||
      candidate.position < 0
    ) {
      return null;
    }

    if (
      typeof candidate.planned !==
        'object' ||
      candidate.planned ===
        null
    ) {
      return null;
    }

    const planned =
      candidate.planned as Record<
        string,
        unknown
      >;

    if (
      !isNullableNumber(
        planned.reps,
      ) ||
      !isNullableNumber(
        planned.loadKg,
      ) ||
      !isNullableNumber(
        planned.distanceM,
      ) ||
      !isNullableNumber(
        planned.durationMs,
      ) ||
      !isNullableNumber(
        planned.resultM,
      ) ||
      !isNullableNumber(
        planned.heightM,
      ) ||
      !isNullableNumber(
        planned.rpe,
      ) ||
      !isNullableNumber(
        planned.rir,
      ) ||
      !isNullableNumber(
        planned.restSeconds,
      ) ||
      (
        planned.notes !==
          null &&
        typeof planned.notes !==
          'string'
      )
    ) {
      return null;
    }

    return {
      position:
        candidate.position,

      planned: {
        reps:
          planned.reps,

        loadKg:
          planned.loadKg,

        distanceM:
          planned.distanceM,

        durationMs:
          planned.durationMs,

        resultM:
          planned.resultM,

        heightM:
          planned.heightM,

        rpe:
          planned.rpe,

        rir:
          planned.rir,

        restSeconds:
          planned.restSeconds,

        notes:
          planned.notes,
      },
    };
  };

const parseReorderPerformanceEntriesBody =
  (
    value:
      unknown,
  ): ReorderPerformanceEntriesBody | null => {
    if (
      typeof value !==
        'object' ||
      value ===
        null
    ) {
      return null;
    }

    const candidate =
      value as Record<
        string,
        unknown
      >;

    if (
      !Array.isArray(
        candidate.orderedIds,
      )
    ) {
      return null;
    }

    if (
      !candidate.orderedIds.every(
        isUuid,
      )
    ) {
      return null;
    }

    return {
      orderedIds:
        candidate.orderedIds,
    };
  };

const parseUpdatePerformanceEntryBody =
  (
    value:
      unknown,
  ): UpdatePerformanceEntryBody | null => {

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
      typeof candidate.planned !==
        'object' ||
      candidate.planned === null
    ) {
      return null;
    }

    const planned =
      candidate.planned as Record<
        string,
        unknown
      >;

    const numericFields = [
      'reps',
      'loadKg',
      'distanceM',
      'durationMs',
      'resultM',
      'heightM',
      'rpe',
      'rir',
      'restSeconds',
    ] as const;

    for (
      const field of
      numericFields
    ) {
      if (
        planned[field] !==
          null &&
        typeof planned[field] !==
          'number'
      ) {
        return null;
      }
    }

    if (
      planned.notes !==
        null &&
      typeof planned.notes !==
        'string'
    ) {
      return null;
    }

    return {
      planned: {
        reps:
          planned.reps as
            number | null,

        loadKg:
          planned.loadKg as
            number | null,

        distanceM:
          planned.distanceM as
            number | null,

        durationMs:
          planned.durationMs as
            number | null,

        resultM:
          planned.resultM as
            number | null,

        heightM:
          planned.heightM as
            number | null,

        rpe:
          planned.rpe as
            number | null,

        rir:
          planned.rir as
            number | null,

        restSeconds:
          planned.restSeconds as
            number | null,

        notes:
          planned.notes as
            string | null,
      },
    };
  };

const parsePerformanceEntryParams =
  (
    value:
      unknown,
  ): PerformanceEntryParams | null => {

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
        candidate.performanceEntryId,
      )
    ) {
      return null;
    }

    return {
      athleteId:
        candidate.athleteId,

      performanceEntryId:
        candidate.performanceEntryId,
    };
  };

const parseExerciseSearchQuery =
  (
    value:
      unknown,
  ): ExerciseSearchQuery | null => {
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
      candidate.query !==
        undefined &&
      typeof candidate.query !==
        'string'
    ) {
      return null;
    }

    if (
      candidate.metricProfile !==
        undefined &&
      (
        typeof candidate.metricProfile !==
          'string' ||
        !exerciseMetricProfiles.has(
          candidate.metricProfile as
            ExerciseMetricProfile,
        )
      )
    ) {
      return null;
    }

    if (
      candidate.origin !==
        undefined &&
      candidate.origin !==
        'SYSTEM' &&
      candidate.origin !==
        'CUSTOM'
    ) {
      return null;
    }

    if (
      candidate.sport !==
        undefined &&
      typeof candidate.sport !==
        'string'
    ) {
      return null;
    }

    const result:
      ExerciseSearchQuery =
        {};

    if (
      typeof candidate.query ===
      'string'
    ) {
      result.query =
        candidate.query;
    }

    if (
      typeof candidate.metricProfile ===
      'string'
    ) {
      result.metricProfile =
        candidate.metricProfile as
          ExerciseMetricProfile;
    }

    if (
      candidate.origin ===
        'SYSTEM' ||
      candidate.origin ===
        'CUSTOM'
    ) {
      result.origin =
        candidate.origin;
    }

    if (
      typeof candidate.sport ===
      'string'
    ) {
      result.sport =
        candidate.sport;
    }

    return result;
  };

const parseAddExerciseBody =
  (
    value:
      unknown,
  ): AddExerciseBody | null => {
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
      typeof candidate.position !==
        'number' ||
      !Number.isInteger(
        candidate.position,
      ) ||
      candidate.position < 0
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
      typeof candidate.existingExerciseId ===
      'string'
    ) {
      if (
        !uuidPattern.test(
          candidate.existingExerciseId,
        ) ||
        candidate.manualExercise !==
          undefined
      ) {
        return null;
      }

      return {
        position:
          candidate.position,

        existingExerciseId:
          candidate.existingExerciseId,

        plannedNotes:
          candidate.plannedNotes ??
          null,
      };
    }

    if (
      typeof candidate.manualExercise !==
        'object' ||
      candidate.manualExercise ===
        null ||
      candidate.existingExerciseId !==
        undefined
    ) {
      return null;
    }

    const manual =
      candidate.manualExercise as Record<
        string,
        unknown
      >;

    if (
      typeof manual.name !==
        'string' ||
      typeof manual.metricProfile !==
        'string' ||
      !exerciseMetricProfiles.has(
        manual.metricProfile as
          ExerciseMetricProfile,
      )
    ) {
      return null;
    }

    if (
      manual.category !==
        undefined &&
      manual.category !==
        null &&
      typeof manual.category !==
        'string'
    ) {
      return null;
    }

    if (
      manual.sport !==
        undefined &&
      manual.sport !==
        null &&
      typeof manual.sport !==
        'string'
    ) {
      return null;
    }

    return {
      position:
        candidate.position,

      manualExercise: {
        name:
          manual.name,

        category:
          manual.category ??
          null,

        sport:
          manual.sport ??
          null,

        metricProfile:
          manual.metricProfile as
            ExerciseMetricProfile,
      },

      plannedNotes:
        candidate.plannedNotes ??
        null,
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

const parseSessionExerciseParams =
  (
    value:
      unknown,
  ): SessionExerciseParams | null => {
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
        candidate.sessionExerciseId,
      )
    ) {
      return null;
    }

    return {
      athleteId:
        candidate.athleteId,

      sessionExerciseId:
        candidate.sessionExerciseId,
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

const parseCreateSessionBlockBody =
  (
    value:
      unknown,
  ): CreateSessionBlockBody | null => {
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
      typeof candidate.position !==
        'number' ||
      !Number.isInteger(
        candidate.position,
      ) ||
      candidate.position < 0
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
      position:
        candidate.position,

      title:
        candidate.title,

      notes:
        candidate.notes ??
        null,
    };
  };

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

    app.get(
      '/api/training/exercises',

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

        const query =
          parseExerciseSearchQuery(
            request.query,
          );

        if (!query) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_request',
            });
        }

        return training
          .unitOfWork
          .execute(
            ({
              sessionStructure,
            }) =>
              sessionStructure
                .searchAvailableExercises(
                  actor.id as
                    DkturboUserId,

                  (
                    query.query ??
                    ''
                  ).trim(),

                  {
                    ...(query.metricProfile
                      ? {
                          metricProfile:
                            query.metricProfile,
                        }
                      : {}),

                    ...(query.origin
                      ? {
                          origin:
                            query.origin,
                        }
                      : {}),

                    ...(query.sport
                      ? {
                          sport:
                            query.sport,
                        }
                      : {}),
                  },
                )
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

    app.post(
      '/api/training/athletes/:athleteId/sessions/:sessionId/blocks',

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

        const body =
          parseCreateSessionBlockBody(
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
          const block =
            await createSessionBlock(
              training.unitOfWork,
              {
                athleteId:
                  params.athleteId as
                    AthleteId,

                sessionId:
                  params.sessionId as
                    TrainingSessionId,

                position:
                  body.position,

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
              block,
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
            error instanceof Error &&
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

          if (
            error instanceof Error &&
            (
              error.message ===
                'Session block title is required' ||
              error.message ===
                'Session block position must be a non-negative integer'
            )
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_session_block',
              });
          }

          request.log.error(
            error,
            'Failed to create Training session block',
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

      '/api/training/athletes/:athleteId/blocks/:blockId',

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

          parseBlockParams(

            request.params,

          );

        const body =

          parseUpdateSessionBlockBody(

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

          const block =

            await updateSessionBlock(

              training.unitOfWork,

              {

                athleteId:

                  params.athleteId as
                    AthleteId,

                blockId:

                  params.blockId as
                    SessionBlockId,

                title:
                  body.title,

                notes:
                  body.notes,

                updatedByUserId:

                  actor.id as
                    DkturboUserId,

              },

            );

          return reply
            .code(200)
            .send(
              block,
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

            error instanceof Error &&

            (

              error.message ===
                'Session block not found' ||

              error.message ===
                'Session block does not belong to athlete'

            )

          ) {

            return reply

              .code(404)

              .send({

                error:
                  'training_block_not_found',

              });

          }

          if (

            error instanceof Error &&

            error.message ===
              'Session block title is required'

          ) {

            return reply

              .code(400)

              .send({

                error:
                  'invalid_session_block',

              });

          }

          request.log.error(

            error,

            'Failed to update Training session block',

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

    app.delete(

      '/api/training/athletes/:athleteId/blocks/:blockId',

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

          parseBlockParams(

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

          await deleteSessionBlock(

            training.unitOfWork,

            {

              athleteId:

                params.athleteId as
                  AthleteId,

              blockId:

                params.blockId as
                  SessionBlockId,

              deletedByUserId:

                actor.id as
                  DkturboUserId,

            },

          );

          return reply
            .code(204)
            .send();

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
                'Session block not found' ||

              error.message ===
                'Session block does not belong to athlete'

            )

          ) {

            return reply

              .code(404)

              .send({

                error:
                  'training_block_not_found',

              });

          }

          request.log.error(

            error,

            'Failed to delete Training session block',

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

        app.put(

      '/api/training/athletes/:athleteId/sessions/:sessionId/blocks/order',

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

        const body =

          parseReorderSessionBlocksBody(

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

          const blocks =

            await reorderSessionBlocks(

              training.unitOfWork,

              {

                athleteId:

                  params.athleteId as
                    AthleteId,

                sessionId:

                  params.sessionId as
                    TrainingSessionId,

                orderedIds:

                  body.orderedIds as unknown as
                    readonly SessionBlockId[],

                updatedByUserId:

                  actor.id as
                    DkturboUserId,

              },

            );

          return reply

            .code(200)

            .send({

              blocks,

            });

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

          if (

            error instanceof Error &&

            (

              error.message ===
                'Session block order contains duplicate ids' ||

              error.message ===
                'Session block order must contain every block exactly once'

            )

          ) {

            return reply

              .code(400)

              .send({

                error:
                  'invalid_session_block_order',

              });

          }

          request.log.error(

            error,

            'Failed to reorder Training session blocks',

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
      '/api/training/athletes/:athleteId/blocks/:blockId/exercises',

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
          parseBlockParams(
            request.params,
          );

        const body =
          parseAddExerciseBody(
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
          const baseInput = {
            athleteId:
              params.athleteId as
                AthleteId,

            blockId:
              params.blockId as
                SessionBlockId,

            position:
              body.position,

            plannedNotes:
              body.plannedNotes,

            actualNotes:
              null,

            createdByUserId:
              actor.id as
                DkturboUserId,
          };

          const result =
            'existingExerciseId' in
              body
              ? await addExerciseToSession(
                  training.unitOfWork,
                  {
                    ...baseInput,

                    existingExerciseId:
                      body.existingExerciseId as
                        ExerciseCatalogId,
                  },
                )
              : await addExerciseToSession(
                  training.unitOfWork,
                  {
                    ...baseInput,

                    manualExercise:
                      body.manualExercise,
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
            error instanceof Error &&
            (
              error.message ===
                'Session block not found' ||
              error.message ===
                'Session block does not belong to athlete'
            )
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'training_block_not_found',
              });
          }

          if (
            error instanceof Error &&
            error.message ===
              'Exercise not found'
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'training_exercise_not_found',
              });
          }

          if (
            error instanceof Error &&
            (
              error.message ===
                'Exercise position must be a non-negative integer' ||
              error.message ===
                'Exercise name is required'
            )
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_exercise',
              });
          }

          request.log.error(
            error,
            'Failed to add Training exercise',
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
      '/api/training/athletes/:athleteId/session-exercises/:sessionExerciseId/performance-entries',

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
          parseSessionExerciseParams(
            request.params,
          );

        const body =
          parseCreatePerformanceEntryBody(
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
          const entry =
            await addPerformanceEntry(
              training.unitOfWork,
              {
                athleteId:
                  params.athleteId as
                    AthleteId,

                sessionExerciseId:
                  params.sessionExerciseId as
                    SessionExerciseId,

                position:
                  body.position,

                planned: {
                  reps:
                    body.planned.reps,

                  loadKg:
                    body.planned.loadKg,

                  distanceM:
                    body.planned.distanceM,

                  durationMs:
                    body.planned.durationMs,

                  resultM:
                    body.planned.resultM,

                  heightM:
                    body.planned.heightM,

                  rpe:
                    body.planned.rpe,

                  rir:
                    body.planned.rir,

                  restSeconds:
                    body.planned.restSeconds,

                  notes:
                    body.planned.notes,
                },

                createdByUserId:
                  actor.id as
                    DkturboUserId,
              },
            );

          return reply
            .code(201)
            .send(
              entry,
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
            error instanceof Error &&
            (
              error.message ===
                'Session exercise not found' ||
              error.message ===
                'Session exercise does not belong to athlete'
            )
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'training_session_exercise_not_found',
              });
          }

          if (
            error instanceof Error &&
            (
              error.message ===
                'Performance entry position must be a non-negative integer' ||
              error.message.includes(
                'must be a non-negative integer',
              ) ||
              error.message.includes(
                'must be a non-negative number',
              ) ||
              error.message.includes(
                'must be between 0 and 10',
              )
            )
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_performance_entry',
              });
          }

          request.log.error(
            error,
            'Failed to create Training performance entry',
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

        app.put(
        '/api/training/athletes/:athleteId/session-exercises/:sessionExerciseId/performance-entries/order',
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
            parseSessionExerciseParams(
              request.params,
            );

          const body =
            parseReorderPerformanceEntriesBody(
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
            const entries =
              await reorderPerformanceEntries(
                training.unitOfWork,
                {
                  athleteId:
                    params.athleteId as
                      AthleteId,
                  sessionExerciseId:
                    params.sessionExerciseId as
                      SessionExerciseId,
                  orderedIds:
                    body.orderedIds as unknown as
                      readonly PerformanceEntryId[],
                  updatedByUserId:
                    actor.id as
                      DkturboUserId,
                },
              );

            return reply
              .code(200)
              .send({
                entries,
              });

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
                  'Session exercise not found' ||
                error.message ===
                  'Session exercise does not belong to athlete'
              )
            ) {
              return reply
                .code(404)
                .send({
                  error:
                    'training_session_exercise_not_found',
                });
            }

            if (
              error instanceof Error &&
              (
                error.message ===
                  'Performance entry order contains duplicate ids' ||
                error.message ===
                  'Performance entry order must contain every entry exactly once'
              )
            ) {

              return reply
                .code(400)
                .send({
                  error:
                    'invalid_performance_entry_order',
                });
            }

            request.log.error(
              error,
              'Failed to reorder Training performance entries',
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
      '/api/training/athletes/:athleteId/performance-entries/:performanceEntryId',

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
          parsePerformanceEntryParams(
            request.params,
          );

        const body =
          parseUpdatePerformanceEntryBody(
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
          const entry =
            await updatePerformanceEntryPlanned(
              training.unitOfWork,
              {
                athleteId:
                  params.athleteId as
                    AthleteId,

                performanceEntryId:
                  params.performanceEntryId as
                    PerformanceEntryId,

                reps:
                  body.planned.reps,

                loadKg:
                  body.planned.loadKg,

                distanceM:
                  body.planned.distanceM,

                durationMs:
                  body.planned.durationMs,

                resultM:
                  body.planned.resultM,

                heightM:
                  body.planned.heightM,

                rpe:
                  body.planned.rpe,

                rir:
                  body.planned.rir,

                restSeconds:
                  body.planned.restSeconds,

                notes:
                  body.planned.notes,

                updatedByUserId:
                  actor.id as
                    DkturboUserId,
              },
            );

          return reply
            .code(200)
            .send(
              entry,
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
            error instanceof Error &&
            (
              error.message ===
                'Performance entry not found' ||
              error.message ===
                'Performance entry does not belong to athlete'
            )
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'training_performance_entry_not_found',
              });
          }

          if (
            error instanceof Error &&
            (
              error.message.includes(
                'must be a non-negative integer',
              ) ||
              error.message.includes(
                'must be a non-negative number',
              ) ||
              error.message.includes(
                'must be between 0 and 10',
              )
            )
          ) {
            return reply
              .code(400)
              .send({
                error:
                  'invalid_performance_entry',
              });
          }

          request.log.error(
            error,
            'Failed to update Training performance entry',
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

    app.delete(
      '/api/training/athletes/:athleteId/performance-entries/:performanceEntryId',

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
          parsePerformanceEntryParams(
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
          await deletePerformanceEntry(
            training.unitOfWork,
            {
              athleteId:
                params.athleteId as
                  AthleteId,

              performanceEntryId:
                params.performanceEntryId as
                  PerformanceEntryId,

              deletedByUserId:
                actor.id as
                  DkturboUserId,
            },
          );

          return reply
            .code(204)
            .send();

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
                'Performance entry not found' ||
              error.message ===
                'Performance entry does not belong to athlete'
            )
          ) {
            return reply
              .code(404)
              .send({
                error:
                  'training_performance_entry_not_found',
              });
          }

          request.log.error(
            error,
            'Failed to delete Training performance entry',
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