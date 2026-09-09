import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  AthleteAccess,
  AthleteId,
  DkturboUserId,
  TrainingDay,
  TrainingDayId,
  TrainingSession,
  TrainingSessionId,
  TrainingWeekId,
} from '../domain/index.js';

import type {
  AthleteRepository,
  SessionRepository,
  SessionStructureRepository,
  TrainingUnitOfWork,
  WeekRepository,
} from '../ports/index.js';

import {
  createPlannedSession,
} from './create-planned-session.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =
  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const dayId =
  '40000000-0000-4000-8000-000000000001' as TrainingDayId;

const weekId =
  '30000000-0000-4000-8000-000000000001' as TrainingWeekId;

const sessionId =
  '50000000-0000-4000-8000-000000000001' as TrainingSessionId;

const now =
  new Date(
    '2026-09-08T17:00:00Z',
  );

const day: TrainingDay = {
  id:
    dayId,

  weekId,

  athleteId,

  date:
    '2026-09-08',

  notes:
    null,

  createdAt:
    now,

  updatedAt:
    now,
};

const access:
  AthleteAccess = {
    id:
      '60000000-0000-4000-8000-000000000001',

  athleteId,

  userId,

  role:
    'COACH',

  createdAt:
    now,
};

const session:
  TrainingSession = {
    id:
      sessionId,

    dayId,

    athleteId,

    type:
      'STRENGTH',

    title:
      'Sentadilla',

    plannedStartTime:
      '18:00',

    plannedDurationMinutes:
      75,

    actualStartTime:
      null,

    actualDurationMinutes:
      null,

    status:
      'PLANNED',

    plannedNotes:
      '4x6',

    actualNotes:
      null,

    plannedRpe:
      8,

    actualRpe:
      null,

    source:
      'MANUAL',

    externalId:
      null,

    createdByUserId:
      userId,

    createdAt:
      now,

    updatedAt:
      now,
};

const sessionStructureRepository =
  {} as SessionStructureRepository;

const createAthleteRepository =
  (): AthleteRepository => ({
    create:
      vi.fn(),

    findById:
      vi.fn(),

    listForUser:
      vi.fn(),

    grantAccess:
      vi.fn(),

    findAccess:
      vi.fn()
        .mockResolvedValue(
          access,
        ),
  });

const createWeekRepository =
  (): WeekRepository => ({
    createWeek:
      vi.fn(),

    createDay:
      vi.fn(),

    findWeekById:
      vi.fn(),

    findWeekByAthleteAndStart:
      vi.fn(),

    listForAthlete:
      vi.fn(),

    findDayById:
      vi.fn()
        .mockResolvedValue(
          day,
        ),

    listDaysForWeek:
      vi.fn(),
  });

const createSessionRepository =
  (): SessionRepository => ({
    createPlanned:
      vi.fn()
        .mockResolvedValue(
          session,
        ),

    findById:
      vi.fn(),

    listForDay:
      vi.fn(),
  });

const createUnitOfWork =
  (
    athletes:
      AthleteRepository,

    weeks:
      WeekRepository,

    sessions:
      SessionRepository,
  ): TrainingUnitOfWork => ({
    execute:
      async (work) =>
        work({
          athletes,
          weeks,
          sessions,

          sessionStructure:
            sessionStructureRepository,
        }),
  });

describe(
  'createPlannedSession',
  () => {

    it(
      'creates a planned session for an authorized athlete and day',
      async () => {

        const athletes =
          createAthleteRepository();

        const weeks =
          createWeekRepository();

        const sessions =
          createSessionRepository();

        const unitOfWork =
          createUnitOfWork(
            athletes,
            weeks,
            sessions,
          );

        const result =
          await createPlannedSession(
            unitOfWork,
            {
              athleteId,

              dayId,

              type:
                'STRENGTH',

              title:
                '  Sentadilla  ',

              plannedStartTime:
                '18:00',

              plannedDurationMinutes:
                75,

              plannedNotes:
                '4x6',

              plannedRpe:
                8,

              createdByUserId:
                userId,
            },
          );

        expect(
          sessions.createPlanned,
        ).toHaveBeenCalledWith({
          athleteId,

          dayId,

          type:
            'STRENGTH',

          title:
            'Sentadilla',

          plannedStartTime:
            '18:00',

          plannedDurationMinutes:
            75,

          plannedNotes:
            '4x6',

          plannedRpe:
            8,

          createdByUserId:
            userId,
        });

        expect(
          result,
        ).toEqual(
          session,
        );

        expect(
          result.actualStartTime,
        ).toBeNull();

        expect(
          result.actualDurationMinutes,
        ).toBeNull();

        expect(
          result.actualNotes,
        ).toBeNull();

        expect(
          result.actualRpe,
        ).toBeNull();
      },
    );

    it(
      'rejects a user without athlete access',
      async () => {

        const athletes =
          createAthleteRepository();

        vi.mocked(
          athletes.findAccess,
        ).mockResolvedValue(
          null,
        );

        const weeks =
          createWeekRepository();

        const sessions =
          createSessionRepository();

        const unitOfWork =
          createUnitOfWork(
            athletes,
            weeks,
            sessions,
          );

        await expect(
          createPlannedSession(
            unitOfWork,
            {
              athleteId,
              dayId,

              type:
                'RUNNING',

              title:
                'Series',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'User does not have write access to athlete',
        );

        expect(
          sessions.createPlanned,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects VIEWER access',
      async () => {

        const athletes =
          createAthleteRepository();

        vi.mocked(
          athletes.findAccess,
        ).mockResolvedValue({
          ...access,
          role:
            'VIEWER',
        });

        const weeks =
          createWeekRepository();

        const sessions =
          createSessionRepository();

        const unitOfWork =
          createUnitOfWork(
            athletes,
            weeks,
            sessions,
          );

        await expect(
          createPlannedSession(
            unitOfWork,
            {
              athleteId,
              dayId,

              type:
                'RUNNING',

              title:
                'Series',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'User does not have write access to athlete',
        );

        expect(
          sessions.createPlanned,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a missing day',
      async () => {

        const athletes =
          createAthleteRepository();

        const weeks =
          createWeekRepository();

        vi.mocked(
          weeks.findDayById,
        ).mockResolvedValue(
          null,
        );

        const sessions =
          createSessionRepository();

        const unitOfWork =
          createUnitOfWork(
            athletes,
            weeks,
            sessions,
          );

        await expect(
          createPlannedSession(
            unitOfWork,
            {
              athleteId,
              dayId,

              type:
                'RUNNING',

              title:
                'Series',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Training day not found',
        );

        expect(
          sessions.createPlanned,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a day belonging to another athlete',
      async () => {

        const athletes =
          createAthleteRepository();

        const weeks =
          createWeekRepository();

        vi.mocked(
          weeks.findDayById,
        ).mockResolvedValue({
          ...day,
          athleteId:
            otherAthleteId,
        });

        const sessions =
          createSessionRepository();

        const unitOfWork =
          createUnitOfWork(
            athletes,
            weeks,
            sessions,
          );

        await expect(
          createPlannedSession(
            unitOfWork,
            {
              athleteId,
              dayId,

              type:
                'RUNNING',

              title:
                'Series',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Training day does not belong to athlete',
        );

        expect(
          sessions.createPlanned,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects an empty title',
      async () => {

        const execute =
          vi.fn();

        const unitOfWork:
          TrainingUnitOfWork = {
            execute,
          };

        await expect(
          createPlannedSession(
            unitOfWork,
            {
              athleteId,
              dayId,

              type:
                'STRENGTH',

              title:
                '   ',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Session title is required',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects an invalid planned start time',
      async () => {

        const execute =
          vi.fn();

        const unitOfWork:
          TrainingUnitOfWork = {
            execute,
          };

        await expect(
          createPlannedSession(
            unitOfWork,
            {
              athleteId,
              dayId,

              type:
                'RUNNING',

              title:
                'Series',

              plannedStartTime:
                '25:70',

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'plannedStartTime must use HH:MM format',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a negative duration',
      async () => {

        const execute =
          vi.fn();

        const unitOfWork:
          TrainingUnitOfWork = {
            execute,
          };

        await expect(
          createPlannedSession(
            unitOfWork,
            {
              athleteId,
              dayId,

              type:
                'RUNNING',

              title:
                'Series',

              plannedDurationMinutes:
                -1,

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'plannedDurationMinutes must be a non-negative integer',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a fractional duration',
      async () => {

        const execute =
          vi.fn();

        const unitOfWork:
          TrainingUnitOfWork = {
            execute,
          };

        await expect(
          createPlannedSession(
            unitOfWork,
            {
              athleteId,
              dayId,

              type:
                'RUNNING',

              title:
                'Series',

              plannedDurationMinutes:
                45.5,

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'plannedDurationMinutes must be a non-negative integer',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects planned RPE outside the 0 to 10 range',
      async () => {

        const execute =
          vi.fn();

        const unitOfWork:
          TrainingUnitOfWork = {
            execute,
          };

        await expect(
          createPlannedSession(
            unitOfWork,
            {
              athleteId,
              dayId,

              type:
                'STRENGTH',

              title:
                'Sentadilla',

              plannedRpe:
                11,

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'plannedRpe must be between 0 and 10',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );
  },
);
