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
  TrainingWeek,
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
  AthleteReadAccessDeniedError,
  getWeekDetail,
} from './index.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =
  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const weekId =
  '30000000-0000-4000-8000-000000000001' as TrainingWeekId;

const dayId =
  '40000000-0000-4000-8000-000000000001' as TrainingDayId;

const sessionId =
  '50000000-0000-4000-8000-000000000001' as TrainingSessionId;

const now =
  new Date(
    '2026-09-09T08:00:00Z',
  );

const week:
  TrainingWeek = {
    id:
      weekId,

    athleteId,

    weekStart:
      '2026-09-07',

    status:
      'PLANNED',

    title:
      'Semana 1',

    notes:
      null,

    createdByUserId:
      userId,

    createdAt:
      now,

    updatedAt:
      now,
  };

const day:
  TrainingDay = {
    id:
      dayId,

    weekId,

    athleteId,

    date:
      '2026-09-09',

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
      '10:00',

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

const createAccess =
  (
    role:
      AthleteAccess['role'],
  ): AthleteAccess => ({
    id:
      'a0000000-0000-4000-8000-000000000001',

    athleteId,

    userId,

    role,

    createdAt:
      now,
  });

const createAthletes =
  (
    role:
      AthleteAccess['role'] | null =
      'COACH',
  ): AthleteRepository => ({
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
          role === null
            ? null
            : createAccess(
                role,
              ),
        ),
  });

const createWeeks =
  (): WeekRepository => ({
    createWeek:
      vi.fn(),

    createDay:
      vi.fn(),

    findWeekById:
      vi.fn()
        .mockResolvedValue(
          week,
        ),

    findWeekByAthleteAndStart:
      vi.fn(),

    listForAthlete:
      vi.fn(),

    findDayById:
      vi.fn(),

    listDaysForWeek:
      vi.fn()
        .mockResolvedValue([
          day,
        ]),

    updateWeek:
      vi.fn(),
  });

const createSessions =
  (): SessionRepository => ({
    createPlanned:
      vi.fn(),

    updatePlanned:
      vi.fn(),

    delete:
      vi.fn(),

    findById:
      vi.fn(),

    listForDay:
      vi.fn()
        .mockResolvedValue([
          session,
        ]),
  });

const sessionStructure =
  {} as SessionStructureRepository;

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
          sessionStructure,

          dailyCheckins:
            {} as never,
        }),
  });

describe(
  'getWeekDetail',
  () => {

    for (
      const role
      of [
        'SELF',
        'COACH',
      ] as const
    ) {
      it(
        `returns writable week detail for ${role}`,
        async () => {

          const result =
            await getWeekDetail(
              createUnitOfWork(
                createAthletes(
                  role,
                ),
                createWeeks(),
                createSessions(),
              ),
              {
                athleteId,
                weekId,
                userId,
              },
            );

          expect(
            result.accessRole,
          ).toBe(
            role,
          );

          expect(
            result.canWrite,
          ).toBe(
            true,
          );

          expect(
            result.week,
          ).toEqual(
            week,
          );

          expect(
            result.days,
          ).toHaveLength(
            1,
          );

          expect(
            result.days[0]
              ?.day,
          ).toEqual(
            day,
          );

          expect(
            result.days[0]
              ?.sessions,
          ).toEqual([
            session,
          ]);
        },
      );
    }

    it(
      'returns read-only week detail for VIEWER',
      async () => {

        const result =
          await getWeekDetail(
            createUnitOfWork(
              createAthletes(
                'VIEWER',
              ),
              createWeeks(),
              createSessions(),
            ),
            {
              athleteId,
              weekId,
              userId,
            },
          );

        expect(
          result.accessRole,
        ).toBe(
          'VIEWER',
        );

        expect(
          result.canWrite,
        ).toBe(
          false,
        );
      },
    );

    it(
      'rejects a user without athlete access',
      async () => {

        await expect(
          getWeekDetail(
            createUnitOfWork(
              createAthletes(
                null,
              ),
              createWeeks(),
              createSessions(),
            ),
            {
              athleteId,
              weekId,
              userId,
            },
          ),
        ).rejects.toBeInstanceOf(
          AthleteReadAccessDeniedError,
        );
      },
    );

    it(
      'rejects a missing week',
      async () => {

        const weeks =
          createWeeks();

        vi.mocked(
          weeks.findWeekById,
        ).mockResolvedValue(
          null,
        );

        await expect(
          getWeekDetail(
            createUnitOfWork(
              createAthletes(),
              weeks,
              createSessions(),
            ),
            {
              athleteId,
              weekId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training week not found',
        );
      },
    );

    it(
      'rejects a week belonging to another athlete',
      async () => {

        const weeks =
          createWeeks();

        vi.mocked(
          weeks.findWeekById,
        ).mockResolvedValue({
          ...week,

          athleteId:
            otherAthleteId,
        });

        await expect(
          getWeekDetail(
            createUnitOfWork(
              createAthletes(),
              weeks,
              createSessions(),
            ),
            {
              athleteId,
              weekId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training week does not belong to athlete',
        );
      },
    );

    it(
      'rejects a day belonging to another week',
      async () => {

        const weeks =
          createWeeks();

        vi.mocked(
          weeks.listDaysForWeek,
        ).mockResolvedValue([
          {
            ...day,

            weekId:
              '30000000-0000-4000-8000-000000000099' as TrainingWeekId,
          },
        ]);

        await expect(
          getWeekDetail(
            createUnitOfWork(
              createAthletes(),
              weeks,
              createSessions(),
            ),
            {
              athleteId,
              weekId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training day does not belong to week',
        );
      },
    );

    it(
      'rejects a day belonging to another athlete',
      async () => {

        const weeks =
          createWeeks();

        vi.mocked(
          weeks.listDaysForWeek,
        ).mockResolvedValue([
          {
            ...day,

            athleteId:
              otherAthleteId,
          },
        ]);

        await expect(
          getWeekDetail(
            createUnitOfWork(
              createAthletes(),
              weeks,
              createSessions(),
            ),
            {
              athleteId,
              weekId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training day does not belong to athlete',
        );
      },
    );

    it(
      'rejects a session belonging to another day',
      async () => {

        const sessions =
          createSessions();

        vi.mocked(
          sessions.listForDay,
        ).mockResolvedValue([
          {
            ...session,

            dayId:
              '40000000-0000-4000-8000-000000000099' as TrainingDayId,
          },
        ]);

        await expect(
          getWeekDetail(
            createUnitOfWork(
              createAthletes(),
              createWeeks(),
              sessions,
            ),
            {
              athleteId,
              weekId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training session does not belong to day',
        );
      },
    );

    it(
      'rejects a session belonging to another athlete',
      async () => {

        const sessions =
          createSessions();

        vi.mocked(
          sessions.listForDay,
        ).mockResolvedValue([
          {
            ...session,

            athleteId:
              otherAthleteId,
          },
        ]);

        await expect(
          getWeekDetail(
            createUnitOfWork(
              createAthletes(),
              createWeeks(),
              sessions,
            ),
            {
              athleteId,
              weekId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training session does not belong to athlete',
        );
      },
    );
  },
);
