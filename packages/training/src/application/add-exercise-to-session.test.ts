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
  SessionBlock,
  SessionBlockId,
  SessionExercise,
  SessionExerciseId,
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
  addExerciseToSession,
} from './add-exercise-to-session.js';

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

const now =
  new Date(
    '2026-09-08T20:00:00Z',
  );

const access:
  AthleteAccess = {
    id:
      '90000000-0000-4000-8000-000000000001',

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
      'Fuerza',

    notes:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };

const exercise:
  ExerciseCatalogItem = {
    id:
      exerciseId,

    name:
      'Sentadilla',

    category:
      'Fuerza',

    sport:
      null,

    metricProfile:
      'STRENGTH',

    origin:
      'SYSTEM',

    createdByUserId:
      null,

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
      null,

    actualNotes:
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

    findBlockById:
      vi.fn()
        .mockResolvedValue(
          block,
        ),

    createCustomExercise:
      vi.fn()
        .mockResolvedValue({
          ...exercise,
          name:
            'Saltos desde banco',
          origin:
            'CUSTOM',
          createdByUserId:
            userId,
        }),

    findExerciseById:
      vi.fn()
        .mockResolvedValue(
          exercise,
        ),

    searchAvailableExercises:
      vi.fn(),

    addExercise:
      vi.fn()
        .mockResolvedValue(
          sessionExercise,
        ),

    findSessionExerciseById:
      vi.fn(),

    createPerformanceEntry:
      vi.fn(),

    listPerformanceEntries:
      vi.fn(),

    listExercisesForBlock:
      vi.fn(),

    findPerformanceEntryById:
      vi.fn(),

    updatePerformanceEntryActual:
      vi.fn(),

    listBlocksForSession:
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
      async (work) =>
        work({
          athletes,
          weeks,
          sessions,
          sessionStructure,
        }),
  });

describe(
  'addExerciseToSession',
  () => {

    it(
      'adds an existing exercise to the block',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        const result =
          await addExerciseToSession(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,
              blockId,
              position:
                0,
              existingExerciseId:
                exerciseId,
              createdByUserId:
                userId,
            },
          );

        expect(
          structure.findExerciseById,
        ).toHaveBeenCalledWith(
          exerciseId,
        );

        expect(
          structure.createCustomExercise,
        ).not.toHaveBeenCalled();

        expect(
          structure.addExercise,
        ).toHaveBeenCalledWith({
          blockId,
          sessionId,
          athleteId,
          exerciseId,
          position:
            0,
          plannedNotes:
            null,
          actualNotes:
            null,
        });

        expect(
          result.createdExercise,
        ).toBe(
          false,
        );
      },
    );

    it(
      'creates and adds a manual custom exercise',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        const result =
          await addExerciseToSession(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,
              blockId,
              position:
                1,

              manualExercise: {
                name:
                  '  Saltos desde banco  ',
                category:
                  'Pliometría',
                metricProfile:
                  'GENERIC',
              },

              createdByUserId:
                userId,
            },
          );

        expect(
          structure.createCustomExercise,
        ).toHaveBeenCalledWith({
          name:
            'Saltos desde banco',
          category:
            'Pliometría',
          sport:
            null,
          metricProfile:
            'GENERIC',
          createdByUserId:
            userId,
        });

        expect(
          structure.addExercise,
        ).toHaveBeenCalledOnce();

        expect(
          result.createdExercise,
        ).toBe(
          true,
        );

        expect(
          result.exercise.origin,
        ).toBe(
          'CUSTOM',
        );

        expect(
          result.exercise.createdByUserId,
        ).toBe(
          userId,
        );
      },
    );

    it(
      'rejects an empty manual exercise name before opening a transaction',
      async () => {

        const execute =
          vi.fn();

        await expect(
          addExerciseToSession(
            {
              execute,
            },
            {
              athleteId,
              blockId,
              position:
                0,

              manualExercise: {
                name:
                  '   ',
                metricProfile:
                  'GENERIC',
              },

              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Exercise name is required',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects an invalid position',
      async () => {

        const execute =
          vi.fn();

        await expect(
          addExerciseToSession(
            {
              execute,
            },
            {
              athleteId,
              blockId,
              position:
                -1,
              existingExerciseId:
                exerciseId,
              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Exercise position must be a non-negative integer',
        );

        expect(
          execute,
        ).not.toHaveBeenCalled();
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
          addExerciseToSession(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,
              blockId,
              position:
                0,
              existingExerciseId:
                exerciseId,
              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Session block not found',
        );

        expect(
          structure.addExercise,
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
          addExerciseToSession(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,
              blockId,
              position:
                0,
              existingExerciseId:
                exerciseId,
              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Session block does not belong to athlete',
        );

        expect(
          structure.addExercise,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects a missing existing exercise',
      async () => {

        const athletes =
          createAthletes();

        const structure =
          createStructure();

        vi.mocked(
          structure.findExerciseById,
        ).mockResolvedValue(
          null,
        );

        await expect(
          addExerciseToSession(
            createUnitOfWork(
              athletes,
              structure,
            ),
            {
              athleteId,
              blockId,
              position:
                0,
              existingExerciseId:
                exerciseId,
              createdByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Exercise not found',
        );

        expect(
          structure.addExercise,
        ).not.toHaveBeenCalled();
      },
    );
  },
);
