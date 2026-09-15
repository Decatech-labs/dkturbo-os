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
  deleteSessionBlock,
} from './delete-session-block.js';

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
      'COACH',

    createdAt:
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
      'Fuerza principal',

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,

  };

const createAthletes =
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

const createStructure =
  (): SessionStructureRepository => ({

    createBlock:
      vi.fn(),

    updateBlock:
      vi.fn(),

    deleteBlock:
      vi.fn()
        .mockResolvedValue(
          true,
        ),

    reorderBlocks:
      vi.fn(),

    findBlockById:
      vi.fn()
        .mockResolvedValue(
          block,
        ),

    listBlocksForSession:
      vi.fn(),

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

  });

const weeks =
  {} as WeekRepository;

const sessions =
  {} as SessionRepository;

const createUnitOfWork =
  (
    athletes:
      AthleteRepository,

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

        }),

  });

describe(
  'deleteSessionBlock',
  () => {

    it(
      'deletes a block for an authorized athlete',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        await deleteSessionBlock(

          createUnitOfWork(
            athletes,
            structure,
          ),

          {
            athleteId,

            blockId,

            deletedByUserId:
              userId,
          },

        );

        expect(
          structure.deleteBlock,
        ).toHaveBeenCalledWith(
          blockId,
          athleteId,
        );

      },
    );

    it(
      'rejects a missing block',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.findBlockById,
        ).mockResolvedValue(
          null,
        );

        await expect(

          deleteSessionBlock(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {
              athleteId,

              blockId,

              deletedByUserId:
                userId,
            },

          ),

        ).rejects.toThrow(
          'Session block not found',
        );

        expect(
          structure.deleteBlock,
        ).not.toHaveBeenCalled();

      },
    );

    it(
      'rejects a block belonging to another athlete',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.findBlockById,
        ).mockResolvedValue({

          ...block,

          athleteId:
            otherAthleteId,

        });

        await expect(

          deleteSessionBlock(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {
              athleteId,

              blockId,

              deletedByUserId:
                userId,
            },

          ),

        ).rejects.toThrow(
          'Session block does not belong to athlete',
        );

        expect(
          structure.deleteBlock,
        ).not.toHaveBeenCalled();

      },
    );

    it(
      'rejects when the scoped delete no longer finds the block',

      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.deleteBlock,
        ).mockResolvedValue(
          false,
        );

        await expect(

          deleteSessionBlock(

            createUnitOfWork(
              athletes,
              structure,
            ),

            {
              athleteId,

              blockId,

              deletedByUserId:
                userId,
            },

          ),

        ).rejects.toThrow(
          'Session block not found',
        );

      },
    );

  },
);
