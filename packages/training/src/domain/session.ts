import type {
  AthleteId,
  DkturboUserId,
} from './athlete.js';

import type {
  TrainingDayId,
} from './day.js';

export type TrainingSessionId =
  string & {
    readonly __brand:
      'TrainingSessionId';
  };

export type TrainingSessionType =
  | 'RUNNING'
  | 'STRENGTH'
  | 'SWIMMING'
  | 'CYCLING'
  | 'POLE_VAULT'
  | 'JUMPS'
  | 'THROWS'
  | 'TECHNIQUE'
  | 'REHAB'
  | 'MOBILITY'
  | 'OTHER';

export type TrainingSessionStatus =
  | 'PLANNED'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'SKIPPED'
  | 'CANCELLED';

export type TrainingDataSource =
  | 'MANUAL'
  | 'GARMIN'
  | 'FIT'
  | 'TCX'
  | 'APPLE_HEALTH'
  | 'IMPORT';

export interface TrainingSession {
  id: TrainingSessionId;
  dayId: TrainingDayId;
  athleteId: AthleteId;

  type: TrainingSessionType;
  title: string;

  plannedStartTime:
    string | null;

  plannedDurationMinutes:
    number | null;

  actualStartTime:
    string | null;

  actualDurationMinutes:
    number | null;

  status:
    TrainingSessionStatus;

  plannedNotes:
    string | null;

  actualNotes:
    string | null;

  plannedRpe:
    number | null;

  actualRpe:
    number | null;

  source:
    TrainingDataSource;

  externalId:
    string | null;

  createdByUserId:
    DkturboUserId;

  createdAt: Date;
  updatedAt: Date;
}
