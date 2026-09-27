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

export interface UpdatePlannedSessionData {
  sessionId:
    TrainingSessionId;

  athleteId:
    AthleteId;

  dayId:
    TrainingDayId;

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
}

export interface SessionRepository {
  createPlanned(
    data:
      CreatePlannedSessionData,
  ): Promise<TrainingSession>;

  updatePlanned(
    data:
      UpdatePlannedSessionData,
  ): Promise<TrainingSession | null>;

  delete(
    sessionId:
      TrainingSessionId,

    athleteId:
      AthleteId,
  ): Promise<boolean>;

  findById(
    sessionId:
      TrainingSessionId,
  ): Promise<TrainingSession | null>;

  listForDay(
    dayId:
      TrainingDayId,
  ): Promise<TrainingSession[]>;
}
