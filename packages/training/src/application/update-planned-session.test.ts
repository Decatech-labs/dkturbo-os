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
  updatePlannedSession,
} from './update-planned-session.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =
  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const sessionId =
  '50000000-0000-4000-8000-000000000001' as TrainingSessionId;

const dayId =
  '40000000-0000-4000-8000-000000000001' as TrainingDayId;

const weekId =
  '30000000-0000-4000-8000-000000000001' as TrainingWeekId;

const now =
  new Date(
    '2026-09-17T17:00:00Z',
  );

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

const day:
  TrainingDay = {
    id:
      dayId,

    weekId,

    athleteId,

    date:
      '2026-09-18',

    notes:
      null,

    createdAt:
      now,

    updatedAt:
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
      'Fuerza',

    plannedStartTime:
      '18:00',

    plannedDurationMinutes:
      60,

    actualStartTime:
      null,

    actualDurationMinutes:
      null,

    status:
      'PLANNED',

    plannedNotes:
      null,

    actualNotes:
      null,

    plannedRpe:
      7,

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

const updatedSession:
  TrainingSession = {
    ...session,

    type:
      'RUNNING',

    title:
      'Series 6x200',

    plannedStartTime:
      '19:15',

    plannedDurationMinutes:
      75,

    plannedNotes:
      'Recuperación completa',

    plannedRpe:
      8,
  };

const sessionStructureRepository =
  {} as SessionStructureRepository;

const createAthletes =
  (): AthleteRepository => ({
    create:
      vi.fn(),

    findById:
      vi.fn(),

    listAll:
      vi.fn(),

    listForUser:
      vi.fn(),

    grantAccess:
      vi.fn(),

    revokeAccess:
      vi.fn(),

    findAccess:
      vi.fn()
        .mockResolvedValue(
          access,
        ),
  });

const createWeeks =
  (): WeekRepository => ({
    createWeek:
      vi.fn(),

    updateWeek:
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

const createSessions =
  (): SessionRepository => ({
    createPlanned:
      vi.fn(),

    updatePlanned:
      vi.fn()
        .mockResolvedValue(
          updatedSession,
        ),

    delete:
      vi.fn(),

    findById:
      vi.fn()
        .mockResolvedValue(
          session,
        ),

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

          dailyCheckins:
            {} as never,
        }),
  });

describe(
  'updatePlannedSession',
  () => {

    it(
      'updates planned session fields for an authorized athlete',
      async () => {

        const athletes =
          createAthletes();

        const weeks =
          createWeeks();

        const sessions =
          createSessions();

        const unitOfWork =
          createUnitOfWork(
            athletes,
            weeks,
            sessions,
          );

        const result =
          await updatePlannedSession(
            unitOfWork,
            {
              athleteId,

              sessionId,

              dayId,

              type:
                'RUNNING',

              title:
                '  Series 6x200  ',

              plannedStartTime:
                '19:15',

              plannedDurationMinutes:
                75,

              plannedNotes:
                'Recuperación completa',

              plannedRpe:
                8,

              updatedByUserId:
                userId,
            },
          );

        expect(
          sessions.updatePlanned,
        ).toHaveBeenCalledWith({
          athleteId,

          sessionId,

          dayId,

          type:
            'RUNNING',

          title:
            'Series 6x200',

          plannedStartTime:
            '19:15',

          plannedDurationMinutes:
            75,

          plannedNotes:
            'Recuperación completa',

          plannedRpe:
            8,
        });

        expect(
          result,
        ).toEqual(
          updatedSession,
        );

      },
    );

    it(
      'rejects a session belonging to another athlete',
      async () => {

        const athletes =
          createAthletes();

        const weeks =
          createWeeks();

        const sessions =
          createSessions();

        vi.mocked(
          sessions.findById,
        ).mockResolvedValue({
          ...session,

          athleteId:
            otherAthleteId,
        });

        const unitOfWork =
          createUnitOfWork(
            athletes,
            weeks,
            sessions,
          );

        await expect(
          updatePlannedSession(
            unitOfWork,
            {
              athleteId,

              sessionId,

              dayId,

              type:
                'STRENGTH',

              title:
                'Fuerza',

              updatedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Training session does not belong to athlete',
        );

        expect(
          sessions.updatePlanned,
        ).not.toHaveBeenCalled();

      },
    );

    it(
      'rejects a destination day belonging to another athlete',
      async () => {

        const athletes =
          createAthletes();

        const weeks =
          createWeeks();

        const sessions =
          createSessions();

        vi.mocked(
          weeks.findDayById,
        ).mockResolvedValue({
          ...day,

          athleteId:
            otherAthleteId,
        });

        const unitOfWork =
          createUnitOfWork(
            athletes,
            weeks,
            sessions,
          );

        await expect(
          updatePlannedSession(
            unitOfWork,
            {
              athleteId,

              sessionId,

              dayId,

              type:
                'STRENGTH',

              title:
                'Fuerza',

              updatedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Training day does not belong to athlete',
        );

        expect(
          sessions.updatePlanned,
        ).not.toHaveBeenCalled();

      },
    );

    it(
      'rejects invalid planned session values',
      async () => {

        const unitOfWork =
          createUnitOfWork(
            createAthletes(),
            createWeeks(),
            createSessions(),
          );

        await expect(
          updatePlannedSession(
            unitOfWork,
            {
              athleteId,

              sessionId,

              dayId,

              type:
                'RUNNING',

              title:
                'Series',

              plannedStartTime:
                '29:90',

              updatedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'plannedStartTime must use HH:MM format',
        );

      },
    );

  },
);
