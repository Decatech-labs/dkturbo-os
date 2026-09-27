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
  listWeeksForAthlete,
} from './index.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =
  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const now =
  new Date(
    '2026-09-09T08:00:00Z',
  );

const createWeek =
  (
    id:
      string,
    weekStart:
      string,
    athlete:
      AthleteId =
        athleteId,
  ): TrainingWeek => ({
    id:
      id as TrainingWeekId,

    athleteId:
      athlete,

    weekStart,

    status:
      'PLANNED',

    title:
      null,

    notes:
      null,

    createdByUserId:
      userId,

    createdAt:
      now,

    updatedAt:
      now,
  });

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
      AthleteAccess['role'] | null,
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
  (
    weeks:
      TrainingWeek[],
  ): WeekRepository => ({
    createWeek:
      vi.fn(),

    createDay:
      vi.fn(),

    findWeekById:
      vi.fn(),

    findWeekByAthleteAndStart:
      vi.fn(),

    listForAthlete:
      vi.fn()
        .mockResolvedValue(
          weeks,
        ),

    findDayById:
      vi.fn(),

    listDaysForWeek:
      vi.fn(),

    updateWeek:
      vi.fn(),
  });

const sessions =
  {} as SessionRepository;

const sessionStructure =
  {} as SessionStructureRepository;

const createUnitOfWork =
  (
    athletes:
      AthleteRepository,
    weeks:
      WeekRepository,
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
  'listWeeksForAthlete',
  () => {

    for (
      const role
      of [
        'SELF',
        'COACH',
      ] as const
    ) {
      it(
        `returns writable weeks for ${role}`,
        async () => {

          const weeks = [
            createWeek(
              '30000000-0000-4000-8000-000000000002',
              '2026-09-14',
            ),
            createWeek(
              '30000000-0000-4000-8000-000000000001',
              '2026-09-07',
            ),
          ];

          const result =
            await listWeeksForAthlete(
              createUnitOfWork(
                createAthletes(
                  role,
                ),
                createWeeks(
                  weeks,
                ),
              ),
              {
                athleteId,
                userId,
              },
            );

          expect(
            result,
          ).toHaveLength(
            2,
          );

          expect(
            result[0]
              ?.week.weekStart,
          ).toBe(
            '2026-09-14',
          );

          expect(
            result[0]
              ?.accessRole,
          ).toBe(
            role,
          );

          expect(
            result[0]
              ?.canWrite,
          ).toBe(
            true,
          );
        },
      );
    }

    it(
      'returns read-only weeks for VIEWER',
      async () => {

        const result =
          await listWeeksForAthlete(
            createUnitOfWork(
              createAthletes(
                'VIEWER',
              ),
              createWeeks([
                createWeek(
                  '30000000-0000-4000-8000-000000000001',
                  '2026-09-07',
                ),
              ]),
            ),
            {
              athleteId,
              userId,
            },
          );

        expect(
          result[0]
            ?.accessRole,
        ).toBe(
          'VIEWER',
        );

        expect(
          result[0]
            ?.canWrite,
        ).toBe(
          false,
        );
      },
    );

    it(
      'rejects a user without athlete access',
      async () => {

        await expect(
          listWeeksForAthlete(
            createUnitOfWork(
              createAthletes(
                null,
              ),
              createWeeks([]),
            ),
            {
              athleteId,
              userId,
            },
          ),
        ).rejects.toBeInstanceOf(
          AthleteReadAccessDeniedError,
        );
      },
    );

    it(
      'rejects an inconsistent week belonging to another athlete',
      async () => {

        await expect(
          listWeeksForAthlete(
            createUnitOfWork(
              createAthletes(
                'COACH',
              ),
              createWeeks([
                createWeek(
                  '30000000-0000-4000-8000-000000000099',
                  '2026-09-07',
                  otherAthleteId,
                ),
              ]),
            ),
            {
              athleteId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training week does not belong to athlete',
        );
      },
    );
  },
);
