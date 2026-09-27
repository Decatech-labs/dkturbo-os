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
  ExerciseCatalogId,
  ExerciseCatalogItem,
  PerformanceEntry,
  PerformanceEntryId,
  SessionBlock,
  SessionBlockId,
  SessionExercise,
  SessionExerciseId,
  TrainingDayId,
  TrainingSession,
  TrainingSessionId,
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
  getSessionDetail,
} from './index.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =
  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const sessionId =
  '50000000-0000-4000-8000-000000000001' as TrainingSessionId;

const blockId =
  '60000000-0000-4000-8000-000000000001' as SessionBlockId;

const exerciseId =
  '70000000-0000-4000-8000-000000000001' as ExerciseCatalogId;

const sessionExerciseId =
  '80000000-0000-4000-8000-000000000001' as SessionExerciseId;

const performanceEntryId =
  '90000000-0000-4000-8000-000000000001' as PerformanceEntryId;

const now =
  new Date(
    '2026-09-09T06:00:00Z',
  );

const session:
  TrainingSession = {
    id:
      sessionId,

    dayId:
      '40000000-0000-4000-8000-000000000001' as TrainingDayId,

    athleteId,

    type:
      'STRENGTH',

    title:
      'Fuerza + técnica',

    plannedStartTime:
      '10:00',

    plannedDurationMinutes:
      90,

    actualStartTime:
      null,

    actualDurationMinutes:
      null,

    status:
      'PLANNED',

    plannedNotes:
      'Sesión principal',

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

const block:
  SessionBlock = {
    id:
      blockId,

    sessionId,

    athleteId,

    position:
      0,

    title:
      'Fuerza',

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };

const catalogItem:
  ExerciseCatalogItem = {
    id:
      exerciseId,

    name:
      'Saltos desde banco',

    category:
      'Pliometría',

    sport:
      'Atletismo',

    metricProfile:
      'GENERIC',

    origin:
      'CUSTOM',

    createdByUserId:
      userId,

    createdAt:
      now,

    updatedAt:
      now,

    archivedAt:
      null,
  };

const sessionExercise:
  SessionExercise = {
    id:
      sessionExerciseId,

    blockId,

    sessionId,

    athleteId,

    exerciseId,

    position:
      0,

    plannedNotes:
      '3 bloques',

    actualNotes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };

const performanceEntry:
  PerformanceEntry = {
    id:
      performanceEntryId,

    sessionExerciseId,

    athleteId,

    position:
      0,

    plannedReps:
      6,

    actualReps:
      6,

    plannedLoadKg:
      80,

    actualLoadKg:
      82.5,

    plannedDistanceM:
      null,

    actualDistanceM:
      null,

    plannedDurationMs:
      null,

    actualDurationMs:
      null,

    plannedResultM:
      null,

    actualResultM:
      null,

    plannedHeightM:
      null,

    actualHeightM:
      null,

    plannedRpe:
      8,

    actualRpe:
      8.5,

    plannedRir:
      null,

    actualRir:
      null,

    plannedRestSeconds:
      null,

    actualRestSeconds:
      null,

    actualSuccess:
      null,

    actualIsFoul:
      null,

    plannedMetrics:
      {},

    actualMetrics:
      {},

    plannedNotes:
      null,

    actualNotes:
      null,

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

const createSessions =
  (): SessionRepository => ({
    createPlanned:
      vi.fn(),

    updatePlanned:
      vi.fn(),

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

const createStructure =
  (): SessionStructureRepository => ({
    createBlock:
      vi.fn(),

    findBlockById:
      vi.fn(),

    listBlocksForSession:
      vi.fn()
        .mockResolvedValue([
          block,
        ]),

    createCustomExercise:
      vi.fn(),

    findExerciseById:
      vi.fn()
        .mockResolvedValue(
          catalogItem,
        ),

    searchAvailableExercises:
      vi.fn(),

    addExercise:
      vi.fn(),

    findSessionExerciseById:
      vi.fn(),

    listExercisesForBlock:
      vi.fn()
        .mockResolvedValue([
          sessionExercise,
        ]),

    createPerformanceEntry:
      vi.fn(),

    findPerformanceEntryById:
      vi.fn(),

    updatePerformanceEntryActual:
      vi.fn(),

    listPerformanceEntries:
      vi.fn()
        .mockResolvedValue([
          performanceEntry,
        ]),

    updatePerformanceEntryPlanned:
      vi.fn(),

    deletePerformanceEntry:
      vi.fn(),

    reorderPerformanceEntries:
      vi.fn(),

    updateBlock:
      vi.fn(),

    deleteBlock:
      vi.fn(),

    reorderBlocks:
      vi.fn(),

    updateSessionExercisePlanned:
      vi.fn(),

    deleteSessionExercise:
      vi.fn(),

    applySessionExerciseLayout:
      vi.fn(),
  });

const weeks =
  {} as WeekRepository;

const createUnitOfWork =
  (
    athletes:
      AthleteRepository,

    sessions:
      SessionRepository,

    sessionStructure:
      SessionStructureRepository,

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
  'getSessionDetail',
  () => {

    for (
      const role
      of [
        'SELF',
        'COACH',
      ] as const
    ) {

      it(
        `returns full detail with canWrite for ${role}`,
        async () => {

          const athletes =
            createAthletes(
              role,
            );

          const sessions =
            createSessions();

          const structure =
            createStructure();

          const result =
            await getSessionDetail(
              createUnitOfWork(
                athletes,
                sessions,
                structure,
              ),
              {
                athleteId,
                sessionId,
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
            result.session,
          ).toEqual(
            session,
          );

          expect(
            result.blocks,
          ).toHaveLength(
            1,
          );

          expect(
            result.blocks[0]
              ?.block,
          ).toEqual(
            block,
          );

          expect(
            result.blocks[0]
              ?.exercises,
          ).toHaveLength(
            1,
          );

          expect(
            result.blocks[0]
              ?.exercises[0]
              ?.sessionExercise,
          ).toEqual(
            sessionExercise,
          );

          expect(
            result.blocks[0]
              ?.exercises[0]
              ?.catalogItem,
          ).toEqual(
            catalogItem,
          );

          expect(
            result.blocks[0]
              ?.exercises[0]
              ?.catalogItem
              .createdByUserId,
          ).toBe(
            userId,
          );

          expect(
            result.blocks[0]
              ?.exercises[0]
              ?.performanceEntries,
          ).toEqual([
            performanceEntry,
          ]);
        },
      );
    }

    it(
      'allows VIEWER to read but marks the session as read-only',
      async () => {

        const result =
          await getSessionDetail(
            createUnitOfWork(
              createAthletes(
                'VIEWER',
              ),
              createSessions(),
              createStructure(),
            ),
            {
              athleteId,
              sessionId,
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

        expect(
          result.blocks[0]
            ?.exercises[0]
            ?.performanceEntries[0]
            ?.actualLoadKg,
        ).toBe(
          82.5,
        );
      },
    );

    it(
      'rejects a user without athlete access',
      async () => {

        const sessions =
          createSessions();

        const structure =
          createStructure();

        await expect(
          getSessionDetail(
            createUnitOfWork(
              createAthletes(
                null,
              ),
              sessions,
              structure,
            ),
            {
              athleteId,
              sessionId,
              userId,
            },
          ),
        ).rejects.toBeInstanceOf(
          AthleteReadAccessDeniedError,
        );

        expect(
          sessions.findById,
        ).not.toHaveBeenCalled();

        expect(
          structure.listBlocksForSession,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a missing session',
      async () => {

        const sessions =
          createSessions();

        vi.mocked(
          sessions.findById,
        ).mockResolvedValue(
          null,
        );

        await expect(
          getSessionDetail(
            createUnitOfWork(
              createAthletes(),
              sessions,
              createStructure(),
            ),
            {
              athleteId,
              sessionId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training session not found',
        );
      },
    );

    it(
      'rejects a session belonging to another athlete',
      async () => {

        const sessions =
          createSessions();

        vi.mocked(
          sessions.findById,
        ).mockResolvedValue({
          ...session,

          athleteId:
            otherAthleteId,
        });

        await expect(
          getSessionDetail(
            createUnitOfWork(
              createAthletes(),
              sessions,
              createStructure(),
            ),
            {
              athleteId,
              sessionId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Training session does not belong to athlete',
        );
      },
    );

    it(
      'rejects an inconsistent block belonging to another athlete',
      async () => {

        const structure =
          createStructure();

        vi.mocked(
          structure.listBlocksForSession,
        ).mockResolvedValue([
          {
            ...block,

            athleteId:
              otherAthleteId,
          },
        ]);

        await expect(
          getSessionDetail(
            createUnitOfWork(
              createAthletes(),
              createSessions(),
              structure,
            ),
            {
              athleteId,
              sessionId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Session block does not belong to athlete',
        );
      },
    );

    it(
      'rejects an inconsistent session exercise belonging to another athlete',
      async () => {

        const structure =
          createStructure();

        vi.mocked(
          structure.listExercisesForBlock,
        ).mockResolvedValue([
          {
            ...sessionExercise,

            athleteId:
              otherAthleteId,
          },
        ]);

        await expect(
          getSessionDetail(
            createUnitOfWork(
              createAthletes(),
              createSessions(),
              structure,
            ),
            {
              athleteId,
              sessionId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Session exercise does not belong to athlete',
        );
      },
    );

    it(
      'rejects an inconsistent session exercise belonging to another session',
      async () => {

        const structure =
          createStructure();

        vi.mocked(
          structure.listExercisesForBlock,
        ).mockResolvedValue([
          {
            ...sessionExercise,

            sessionId:
              '50000000-0000-4000-8000-000000000099' as TrainingSessionId,
          },
        ]);

        await expect(
          getSessionDetail(
            createUnitOfWork(
              createAthletes(),
              createSessions(),
              structure,
            ),
            {
              athleteId,
              sessionId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Session exercise does not belong to session',
        );
      },
    );

    it(
      'rejects a missing catalog item',
      async () => {

        const structure =
          createStructure();

        vi.mocked(
          structure.findExerciseById,
        ).mockResolvedValue(
          null,
        );

        await expect(
          getSessionDetail(
            createUnitOfWork(
              createAthletes(),
              createSessions(),
              structure,
            ),
            {
              athleteId,
              sessionId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Exercise catalog item not found',
        );
      },
    );

    it(
      'rejects a performance entry belonging to another athlete',
      async () => {

        const structure =
          createStructure();

        vi.mocked(
          structure.listPerformanceEntries,
        ).mockResolvedValue([
          {
            ...performanceEntry,

            athleteId:
              otherAthleteId,
          },
        ]);

        await expect(
          getSessionDetail(
            createUnitOfWork(
              createAthletes(),
              createSessions(),
              structure,
            ),
            {
              athleteId,
              sessionId,
              userId,
            },
          ),
        ).rejects.toThrow(
          'Performance entry does not belong to athlete',
        );
      },
    );
  },
);
