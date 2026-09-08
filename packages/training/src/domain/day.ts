import type {
  AthleteId,
} from './athlete.js';

import type {
  TrainingWeekId,
} from './week.js';

export type TrainingDayId =
  string & {
    readonly __brand:
      'TrainingDayId';
  };

export interface TrainingDay {
  id: TrainingDayId;
  weekId: TrainingWeekId;
  athleteId: AthleteId;
  date: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
