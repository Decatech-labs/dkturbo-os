import type {
  AthleteRepository,
} from './athlete-repository.port.js';

import type {
  SessionRepository,
} from './session-repository.port.js';

import type {
  SessionStructureRepository,
} from './session-structure-repository.port.js';

import type {
  WeekRepository,
} from './week-repository.port.js';

import type {
  DailyCheckinRepository,
} from './daily-checkin-repository.port.js';

export interface TrainingRepositories {
  athletes:
    AthleteRepository;

  weeks:
    WeekRepository;

  sessions:
    SessionRepository;

  sessionStructure:
    SessionStructureRepository;

  dailyCheckins:
    DailyCheckinRepository;
}

export interface TrainingUnitOfWork {
  execute<T>(
    work: (
      repositories:
        TrainingRepositories,
    ) => Promise<T>,
  ): Promise<T>;
}
