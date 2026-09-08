import type {
  AthleteId,
  DkturboUserId,
  TrainingDayId,
  TrainingSession,
  TrainingSessionId,
  TrainingSessionType,
} from '../domain/index.js';

export interface CreatePlannedSessionData {
  dayId:
    TrainingDayId;

  athleteId:
    AthleteId;

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

  createdByUserId:
    DkturboUserId;
}

export interface SessionRepository {
  createPlanned(
    data:
      CreatePlannedSessionData,
  ): Promise<TrainingSession>;

  findById(
    sessionId:
      TrainingSessionId,
  ): Promise<TrainingSession | null>;

  listForDay(
    dayId:
      TrainingDayId,
  ): Promise<TrainingSession[]>;
}
