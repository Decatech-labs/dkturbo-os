import type {
  AthleteId,
  DkturboUserId,
} from './athlete.js';

export type TrainingWeekId =
  string & {
    readonly __brand:
      'TrainingWeekId';
  };

export type TrainingWeekStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SUBMITTED'
  | 'CLOSED';

export interface TrainingWeek {
  id: TrainingWeekId;
  athleteId: AthleteId;
  weekStart: string;
  status: TrainingWeekStatus;
  title: string | null;
  notes: string | null;
  createdByUserId: DkturboUserId;
  createdAt: Date;
  updatedAt: Date;
}
