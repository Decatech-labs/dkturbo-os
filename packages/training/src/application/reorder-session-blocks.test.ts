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
  SessionBlock,
  SessionBlockId,
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
  reorderSessionBlocks,
} from './reorder-session-blocks.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =
  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const sessionId =
  '50000000-0000-4000-8000-000000000001' as TrainingSessionId;

const blockId1 =
  '60000000-0000-4000-8000-000000000001' as SessionBlockId;

const blockId2 =
  '60000000-0000-4000-8000-000000000002' as SessionBlockId;

const blockId3 =
  '60000000-0000-4000-8000-000000000003' as SessionBlockId;

const now =
  new Date(
    '2026-09-15T15:15:00Z',
  );

const access:
  AthleteAccess = {

    id:
      '70000000-0000-4000-8000-000000000001',

    athleteId,

    userId,

    role:
      'SELF',

    createdAt:
      now,

  };

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
      'Gimnasio',

    plannedStartTime:
      null,

    plannedDurationMinutes:
      null,

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
      null,

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

const createBlock =
  (
    id:
      SessionBlockId,

    position:
      number,
  ): SessionBlock => ({

    id,

    sessionId,

    athleteId,

    position,

    title:
      `Bloque ${position + 1}`,

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,

  });

const block1 =
  createBlock(
    blockId1,
    0,
  );

const block2 =
  createBlock(
    blockId2,
    1,
  );

const block3 =
  createBlock(
    blockId3,
    2,
  );

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

    updateBlock:
      vi.fn(),

    deleteBlock:
      vi.fn(),

    reorderBlocks:
      vi.fn()
        .mockResolvedValue([
          {
            ...block3,
            position:
              0,
          },
          {
            ...block1,
            position:
              1,
          },
          {
            ...block2,
            position:
              2,
          },
        ]),

    findBlockById:
      vi.fn(),

    listBlocksForSession:
      vi.fn()
        .mockResolvedValue([
          block1,
          block2,
          block3,
        ]),

    createCustomExercise:
      vi.fn(),

    findExerciseById:
      vi.fn(),

    searchAvailableExercises:
      vi.fn(),

    addExercise:
      vi.fn(),

    findSessionExerciseById:
      vi.fn(),

    listExercisesForBlock:
      vi.fn(),

    createPerformanceEntry:
      vi.fn(),

    listPerformanceEntries:
      vi.fn(),

    findPerformanceEntryById:
      vi.fn(),

    updatePerformanceEntryPlanned:
      vi.fn(),

    deletePerformanceEntry:
      vi.fn(),

    reorderPerformanceEntries:
      vi.fn(),

    updatePerformanceEntryActual:
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
      async (
        work,
      ) =>
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
  'reorderSessionBlocks',
  () => {

    it(
      'reorders every block in the session',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        const structure =
          createStructure();

        const result =

          await reorderSessionBlocks(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {
              athleteId,

              sessionId,

              orderedIds: [
                blockId3,
                blockId1,
                blockId2,
              ],

              updatedByUserId:
                userId,
            },

          );

        expect(
          structure.reorderBlocks,
        ).toHaveBeenCalledWith(
          sessionId,
          athleteId,
          [
            blockId3,
            blockId1,
            blockId2,
          ],
        );

        expect(
          result.map(
            block =>
              block.id,
          ),
        ).toEqual([
          blockId3,
          blockId1,
          blockId2,
        ]);

      },
    );

    it(
      'rejects duplicate ids before opening a transaction',

      async () => {

        const execute =
          vi.fn();

        await expect(

          reorderSessionBlocks(

            {
              execute,
            },

            {
              athleteId,

              sessionId,

              orderedIds: [
                blockId1,
                blockId1,
                blockId3,
              ],

              updatedByUserId:
                userId,
            },

          ),

        ).rejects.toThrow(
          'Session block order contains duplicate ids',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();

      },
    );

    it(
      'rejects an incomplete order',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        const structure =
          createStructure();

        await expect(

          reorderSessionBlocks(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {
              athleteId,

              sessionId,

              orderedIds: [
                blockId1,
                blockId2,
              ],

              updatedByUserId:
                userId,
            },

          ),

        ).rejects.toThrow(
          'Session block order must contain every block exactly once',
        );

        expect(
          structure.reorderBlocks,
        ).not.toHaveBeenCalled();

      },
    );

    it(
      'rejects an order containing a foreign block id',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        const structure =
          createStructure();

        const foreignBlockId =
          '60000000-0000-4000-8000-000000000099' as SessionBlockId;

        await expect(

          reorderSessionBlocks(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {
              athleteId,

              sessionId,

              orderedIds: [
                blockId1,
                blockId2,
                foreignBlockId,
              ],

              updatedByUserId:
                userId,
            },

          ),

        ).rejects.toThrow(
          'Session block order must contain every block exactly once',
        );

        expect(
          structure.reorderBlocks,
        ).not.toHaveBeenCalled();

      },
    );

    it(
      'rejects a missing session',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        vi.mocked(
          sessions.findById,
        ).mockResolvedValue(
          null,
        );

        const structure =
          createStructure();

        await expect(

          reorderSessionBlocks(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {
              athleteId,

              sessionId,

              orderedIds: [
                blockId1,
                blockId2,
                blockId3,
              ],

              updatedByUserId:
                userId,
            },

          ),

        ).rejects.toThrow(
          'Training session not found',
        );

        expect(
          structure.reorderBlocks,
        ).not.toHaveBeenCalled();

      },
    );

    it(
      'rejects a session belonging to another athlete',

      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        vi.mocked(
          sessions.findById,
        ).mockResolvedValue({

          ...session,

          athleteId:
            otherAthleteId,

        });

        const structure =
          createStructure();

        await expect(

          reorderSessionBlocks(

            createUnitOfWork(
              athletes,
              sessions,
              structure,
            ),

            {
              athleteId,

              sessionId,

              orderedIds: [
                blockId1,
                blockId2,
                blockId3,
              ],

              updatedByUserId:
                userId,
            },

          ),

        ).rejects.toThrow(
          'Training session does not belong to athlete',
        );

        expect(
          structure.reorderBlocks,
        ).not.toHaveBeenCalled();

      },
    );

  },
);
