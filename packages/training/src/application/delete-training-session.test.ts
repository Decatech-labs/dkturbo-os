
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
  TrainingSession,
  TrainingSessionId,
  TrainingDayId,
} from '../domain/index.js';

import type {
  AthleteRepository,
  SessionRepository,
  SessionStructureRepository,
  TrainingUnitOfWork,
  WeekRepository,
} from '../ports/index.js';

import {
  deleteTrainingSession,
} from './delete-training-session.js';

const athleteId =
  '20000000-0000-4000-8000-000000000001' as AthleteId;

const otherAthleteId =
  '20000000-0000-4000-8000-000000000002' as AthleteId;

const userId =
  '10000000-0000-4000-8000-000000000001' as DkturboUserId;

const sessionId =
  '50000000-0000-4000-8000-000000000001' as TrainingSessionId;

const now =
  new Date(
    '2026-09-17T18:00:00Z',
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

const sessionStructureRepository =
  {} as SessionStructureRepository;

const weekRepository =
  {} as WeekRepository;

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
      vi.fn()
        .mockResolvedValue(
          true,
        ),

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

    sessions:
      SessionRepository,
  ): TrainingUnitOfWork => ({
    execute:
      async (work) =>
        work({
          athletes,

          weeks:
            weekRepository,

          sessions,

          sessionStructure:
            sessionStructureRepository,

          dailyCheckins:
            {} as never,
        }),
  });

describe(
  'deleteTrainingSession',
  () => {

    it(
      'deletes a session for an authorized athlete',
      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        const unitOfWork =
          createUnitOfWork(
            athletes,
            sessions,
          );

        await deleteTrainingSession(
          unitOfWork,
          {
            athleteId,

            sessionId,

            deletedByUserId:
              userId,
          },
        );

        expect(
          sessions.delete,
        ).toHaveBeenCalledWith(
          sessionId,
          athleteId,
        );

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

        const unitOfWork =
          createUnitOfWork(
            athletes,
            sessions,
          );

        await expect(
          deleteTrainingSession(
            unitOfWork,
            {
              athleteId,

              sessionId,

              deletedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Training session does not belong to athlete',
        );

        expect(
          sessions.delete,
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

        const unitOfWork =
          createUnitOfWork(
            athletes,
            sessions,
          );

        await expect(
          deleteTrainingSession(
            unitOfWork,
            {
              athleteId,

              sessionId,

              deletedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Training session not found',
        );

        expect(
          sessions.delete,
        ).not.toHaveBeenCalled();

      },
    );

    it(
      'rejects when the session disappears before deletion',
      async () => {

        const athletes =
          createAthletes();

        const sessions =
          createSessions();

        vi.mocked(
          sessions.delete,
        ).mockResolvedValue(
          false,
        );

        const unitOfWork =
          createUnitOfWork(
            athletes,
            sessions,
          );

        await expect(
          deleteTrainingSession(
            unitOfWork,
            {
              athleteId,

              sessionId,

              deletedByUserId:
                userId,
            },
          ),
        ).rejects.toThrow(
          'Training session not found',
        );

      },
    );

  },
);
